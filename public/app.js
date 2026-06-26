const labels = {
  antecipado: "Entrada de ingressos antecipados",
  hora: "Entrada de ingressos pagos na hora",
  convidado: "Entrada de convidados, idosos e crianças",
  correcao: "Correção",
};

const totals = [
  document.querySelector("#header-total"),
  document.querySelector("#main-total"),
  document.querySelector("#dashboard-total"),
];

const statusMessage = document.querySelector("#status-message");
const logsBody = document.querySelector("#logs-body");

function setStatus(message) {
  statusMessage.textContent = message;
  if (message) {
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      statusMessage.textContent = "";
    }, 2600);
  }
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function renderLogs(logs) {
  if (!logs.length) {
    logsBody.innerHTML = '<tr><td colspan="3" class="empty">Nenhum registro ainda.</td></tr>';
    return;
  }

  logsBody.innerHTML = logs
    .slice()
    .reverse()
    .map((row) => {
      const delta = Number(row.delta) > 0 ? "+1" : "-1";
      return `
        <tr>
          <td>${formatDate(row.horario)}</td>
          <td>${labels[row.tipo] || row.tipo}</td>
          <td>${delta}</td>
        </tr>
      `;
    })
    .join("");
}

function renderState(state) {
  totals.forEach((element) => {
    element.textContent = state.total;
  });

  Object.entries(state.counts).forEach(([key, value]) => {
    const element = document.querySelector(`#count-${key}`);
    if (element) {
      element.textContent = value;
    }
  });

  renderLogs(state.logs || []);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Falha na comunicação com o servidor.");
  }
  return data;
}

async function loadState() {
  try {
    renderState(await requestJson("/api/state"));
  } catch (error) {
    setStatus(error.message);
  }
}

async function downloadDashboardPdf() {
  const button = document.querySelector("#download-pdf-button");
  const title = document.querySelector("#event-title").value.trim() || "Controle da Entrada";
  
  const total = document.querySelector("#dashboard-total").textContent;
  const antecipado = document.querySelector("#count-antecipado").textContent;
  const hora = document.querySelector("#count-hora").textContent;
  const convidado = document.querySelector("#count-convidado").textContent;
  const correcao = document.querySelector("#count-correcao").textContent;

  const originalText = button.textContent;
  button.textContent = "Gerando PDF...";
  button.disabled = true;

  const container = document.createElement("div");
  container.innerHTML = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; background: #ffffff;">
      <div style="border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="font-size: 28px; font-weight: 800; margin: 0; color: #0f172a; letter-spacing: -0.5px;">${title}</h1>
          <p style="font-size: 13px; color: #94a3b8; margin: 6px 0 0 0; font-weight: 500;">Relatório de Fluxo e Ocupação do Evento</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: 600;">Data de Exportação</p>
          <p style="font-size: 13px; color: #334155; margin: 4px 0 0 0; font-weight: 700;">${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date())}</p>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 12px; padding: 30px; margin-bottom: 24px; text-align: center; color: #ffffff;">
        <span style="font-size: 13px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Pessoas no Total Atual</span>
        <strong style="display: block; font-size: 56px; font-weight: 800; margin-top: 8px; line-height: 1; letter-spacing: -1px;">${total}</strong>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background: #f8fafc;">
          <span style="font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Ingressos Antecipados</span>
          <strong style="display: block; font-size: 32px; font-weight: 800; color: #0f172a; margin-top: 8px;">${antecipado}</strong>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background: #f8fafc;">
          <span style="font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Pagos na Hora</span>
          <strong style="display: block; font-size: 32px; font-weight: 800; color: #0f172a; margin-top: 8px;">${hora}</strong>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background: #f8fafc;">
          <span style="font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Convidados, Idosos ou Crianças</span>
          <strong style="display: block; font-size: 32px; font-weight: 800; color: #0f172a; margin-top: 8px;">${convidado}</strong>
        </div>
        <div style="border: 1px solid #fee2e2; border-radius: 12px; padding: 20px; background: #fff5f5;">
          <span style="font-size: 13px; color: #991b1b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Correções Efetuadas</span>
          <strong style="display: block; font-size: 32px; font-weight: 800; color: #991b1b; margin-top: 8px;">${correcao}</strong>
        </div>
      </div>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_dashboard.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 3, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  try {
    await html2pdf().set(opt).from(container.firstElementChild).save();
    setStatus("Dashboard exportado com sucesso.");
  } catch (error) {
    setStatus("Erro ao exportar PDF.");
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}`).classList.add("active");
    loadState();
  });
});

document.querySelectorAll("[data-entry]").forEach((button) => {
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      const state = await requestJson("/api/entry", {
        method: "POST",
        body: JSON.stringify({ tipo: button.dataset.entry }),
      });
      renderState(state);
      setStatus("Registro salvo no CSV.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      button.disabled = false;
      button.focus();
    }
  });
});

document.querySelector("#reset-button").addEventListener("click", async () => {
  const confirmed = window.confirm("Zerar todos os registros do CSV?");
  if (!confirmed) return;
  try {
    renderState(await requestJson("/api/reset", { method: "POST" }));
    setStatus("Registros zerados.");
  } catch (error) {
    setStatus(error.message);
  }
});

document.querySelector("#download-pdf-button").addEventListener("click", downloadDashboardPdf);

loadState();
window.setInterval(loadState, 1500);