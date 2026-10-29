
(() => {
  "use strict";

  // ─────────────────────────────────────
  // Nova AI · Motor de conversación
  // ─────────────────────────────────────

  const messagesContainer = document.getElementById("messages");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  if (!messagesContainer || !userInput || !sendBtn) {
    console.error("Nova: faltan elementos del chat en el HTML.");
    return;
  }

  const CONFIG = {
    // Cambiar por el endpoint real de tu backend.
    apiUrl: "/api/chat",

    // Cantidad máxima de mensajes enviados como contexto.
    maxHistoryMessages: 40,

    // Límite de entrada para evitar mensajes enormes.
    maxInputLength: 12000,

    // Desactivado hasta conectar un backend real.
    useApi: false
  };

  let history = [];
  let isSending = false;
  let currentController = null;

  // ─────────────────────────────────────
  // Interfaz
  // ─────────────────────────────────────

  function scrollToBottom() {
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: "smooth"
    });
  }

  function addMessage(text, isUser = false, options = {}) {
    const message = document.createElement("div");

    message.className = `message ${isUser ? "user" : "bot"}`;

    if (options.error) {
      message.dataset.error = "true";
    }

    // textContent evita interpretar mensajes como HTML.
    message.textContent = text;

    messagesContainer.appendChild(message);
    scrollToBottom();

    return message;
  }

  function addTypingIndicator() {
    const indicator = document.createElement("div");

    indicator.className = "message bot";
    indicator.setAttribute("role", "status");
    indicator.setAttribute("aria-label", "Nova está pensando");
    indicator.textContent = "Nova está pensando…";

    messagesContainer.appendChild(indicator);
    scrollToBottom();

    return indicator;
  }

  function setLoading(loading) {
    isSending = loading;

    sendBtn.disabled = loading;
    userInput.disabled = loading;

    sendBtn.textContent = loading ? "Pensando…" : "Enviar";

    if (loading) {
      sendBtn.setAttribute("aria-busy", "true");
    } else {
      sendBtn.removeAttribute("aria-busy");
      userInput.focus();
    }
  }

  // ─────────────────────────────────────
  // Historial
  // ─────────────────────────────────────

  function saveToHistory(role, content) {
    history.push({ role, content });

    if (history.length > CONFIG.maxHistoryMessages) {
      history = history.slice(-CONFIG.maxHistoryMessages);
    }
  }

  function getHistory() {
    return history.map(message => ({
      role: message.role,
      content: message.content
    }));
  }

  // ─────────────────────────────────────
  // Conexión al backend
  // ─────────────────────────────────────

  async function requestNova() {
    currentController = new AbortController();

    const response = await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      signal: currentController.signal,
      body: JSON.stringify({
        messages: getHistory(),
        model: getSelectedModel()
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Iniciá sesión para continuar.");
      }

      if (response.status === 429) {
        throw new Error("Alcanzaste tu límite de uso. Revisá tu plan.");
      }

      throw new Error("No se pudo obtener una respuesta de Nova.");
    }

    const data = await response.json();

    if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("El servidor devolvió una respuesta inválida.");
    }

    return data;
  }

  function getSelectedModel() {
    const selector = document.getElementById("model-select");

    return selector?.value || "nova-flash";
  }

  // ─────────────────────────────────────
  // Modo de demostración
  // ─────────────────────────────────────

  function demoResponse(text) {
    const normalized = text.toLowerCase();

    if (/^(hola|buenas|buenos días|buenas tardes|buenas noches)\b/.test(normalized)) {
      return "¡Hola! Soy Nova. La interfaz está funcionando, pero todavía necesito conectarme a un modelo de IA para mantener una conversación real.";
    }

    if (normalized.includes("memoria")) {
      return "La memoria persistente todavía no está conectada. Para recordar conversaciones entre sesiones, necesitamos guardar los datos en el backend y recuperarlos por usuario.";
    }

    if (normalized.includes("modelo") || normalized.includes("api")) {
      return "Nova necesita un backend que se comunique con el proveedor del modelo. La clave privada debe permanecer en el servidor, nunca en el navegador.";
    }

    return "Recibí tu mensaje y la interfaz funciona correctamente. Esta es una respuesta de demostración, no una respuesta generada por inteligencia artificial. Conectá el backend para activar la conversación real.";
  }

  // ─────────────────────────────────────
  // Envío de mensajes
  // ─────────────────────────────────────

  async function sendMessage() {
    if (isSending) return;

    const text = userInput.value.trim();

    if (!text) return;

    if (text.length > CONFIG.maxInputLength) {
      addMessage(
        `El mensaje supera el límite de ${CONFIG.maxInputLength.toLocaleString("es-AR")} caracteres.`,
        false,
        { error: true }
      );
      return;
    }

    // Mostrar el mensaje del usuario.
    addMessage(text, true);
    userInput.value = "";
    userInput.style.height = "auto";

    // El contexto se conserva en el historial de esta sesión.
    saveToHistory("user", text);

    setLoading(true);

    const typing = addTypingIndicator();

    try {
      let reply;

      if (CONFIG.useApi) {
        const data = await requestNova();
        reply = data.reply;

        // Mostrar consumo real únicamente si lo informa el servidor.
        if (Number.isFinite(data.totalTokens)) {
          updateTokenDisplay(data.totalTokens);
        }
      } else {
        // Demostración local sin llamadas de red.
        await new Promise(resolve => setTimeout(resolve, 500));
        reply = demoResponse(text);
      }

      typing.remove();

      addMessage(reply, false);
      saveToHistory("assistant", reply);

    } catch (error) {
      typing.remove();

      const errorMessage = error.name === "AbortError"
        ? "La solicitud fue cancelada."
        : error.message || "Ocurrió un error inesperado.";

      addMessage(errorMessage, false, { error: true });

      // No se elimina el mensaje del usuario del historial.
      // Podrá volver a enviarse cuando se resuelva el problema.

    } finally {
      currentController = null;
      setLoading(false);
    }
  }

  // ─────────────────────────────────────
  // Consumo de tokens
  // ─────────────────────────────────────

  function updateTokenDisplay(totalTokens) {
    const tokenElement = document.getElementById("token-count");

    // Actualizar solo un elemento real existente.
    if (tokenElement) {
      tokenElement.textContent =
        Number(totalTokens).toLocaleString("es-AR");
    }
  }

  // ─────────────────────────────────────
  // Eventos
  // ─────────────────────────────────────

  sendBtn.addEventListener("click", sendMessage);

  userInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  // Ajustar automáticamente la altura del campo si es textarea.
  userInput.addEventListener("input", () => {
    if (userInput.tagName === "TEXTAREA") {
      userInput.style.height = "auto";
      userInput.style.height =
        Math.min(userInput.scrollHeight, 160) + "px";
    }
  });

  // Opcional: cancelar una solicitud al cerrar o abandonar la página.
  window.addEventListener("pagehide", () => {
    currentController?.abort();
  });

  // Permitir que otros controles de la interfaz inicien un chat.
  document.querySelectorAll("[data-prompt]").forEach(button => {
    button.addEventListener("click", () => {
      userInput.value = button.dataset.prompt || "";
      userInput.focus();
    });
  });

  // ─────────────────────────────────────
  // API pública de la interfaz
  // ─────────────────────────────────────

  window.NovaChat = {
    clear() {
      if (isSending) return;

      history = [];
      messagesContainer.replaceChildren();
      userInput.value = "";
      userInput.focus();
    },

    cancel() {
      currentController?.abort();
    },

    getHistory,

    connectApi() {
      CONFIG.useApi = true;
    }
  };

})();
