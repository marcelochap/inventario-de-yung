import { FORMS } from "./data/forms.js";
import {
  $,
  toast,
  escapeHtml,
  loadFormState,
  saveFormState,
  setMetaToAllForms,
  answeredCount,
  groupItems,
  download
} from "./data/utils.js";

let active = "YRAI";

function setTabSelected(formKey){
  for(const btn of document.querySelectorAll(".tab")){
    const isActive = btn.id === `tab-${formKey}`;
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  }
}

function updateSidebarStats(){
  const {answered, total, pct} = answeredCount(FORMS, active);
  $("answeredMeta").textContent = `Respondidas: ${answered}`;
  $("totalMeta").textContent = `Total: ${total}`;
  $("pctMeta").textContent = `${pct}%`;
  $("progressBar").style.width = `${pct}%`;
}

function renderInstructions(form){
  // Cards de escala 1..6, cada um em seu bloco destacado
  const cards = form.scaleLabels
    .map((label, i) => {
      const v = i + 1;
      const colorVar = `--c${v}`;
      return `
        <div class="scale-card">
          <div>
            <span class="n" style="background: color-mix(in srgb, var(${colorVar}) 75%, rgba(255,255,255,.12));">
              ${v}
            </span>
            <span class="t">${escapeHtml(label)}</span>
          </div>
        </div>
      `;
    })
    .join("");

  $("instructions").innerHTML = `
    <div class="instructions">
      <div class="intro">${escapeHtml(form.instructions)}</div>
      <div class="scale-cards">
        ${cards}
      </div>
    </div>
  `;
}

function render(){
  const form = FORMS[active];
  $("activePill").textContent = form.title;
  $("formTitle").textContent = form.title;
  $("formKey").textContent = form.key;

  renderInstructions(form);

  // meta
  const st = loadFormState(active);
  $("nome").value = st.meta?.nome || "";
  $("data").value = st.meta?.data || "";

  // questions
  const container = $("questions");
  container.innerHTML = "";

  const groups = groupItems(form.items, form.groupSize || 20);

  for(const g of groups){
    const det = document.createElement("details");
    det.open = true;

    const sum = document.createElement("summary");
    const left = document.createElement("span");
    left.textContent = g.label;

    const right = document.createElement("span");
    right.className = "muted";
    right.style.fontSize = "12px";
    right.textContent = "Clique para recolher/abrir";

    sum.append(left, right);

    const qs = document.createElement("div");
    qs.className = "qs";

    for(const [n, text] of g.items){
      const row = document.createElement("div");
      row.className = "q";
      row.dataset.qnum = String(n);

      const txt = document.createElement("div");
      txt.className = "txt";
      txt.innerHTML = `<span class="num">${n}.</span> ${escapeHtml(text)}`;

      const scale = document.createElement("div");
      scale.className = "scale";

      for(let v=1; v<=6; v++){
        const lab = document.createElement("label");
        lab.className = "opt";
        lab.dataset.v = String(v); // <-- ESSENCIAL para cor funcionar
        lab.title = form.scaleLabels[v-1] || `Opção ${v}`;

        const inp = document.createElement("input");
        inp.type = "radio";
        inp.name = `q_${n}`;
        inp.value = String(v);
        if(Number(st.answers?.[n]) === v) inp.checked = true;

        inp.addEventListener("change", ()=>{
          const curr = loadFormState(active);
          curr.answers = curr.answers || {};
          curr.answers[n] = v;
          curr.meta = { nome: $("nome").value || "", data: $("data").value || "" };
          saveFormState(active, curr);
          updateSidebarStats();
        });

        const span = document.createElement("span");
        span.textContent = v;

        lab.append(inp, span);
        scale.append(lab);
      }

      row.append(txt, scale);
      qs.append(row);
    }

    det.append(sum, qs);
    container.append(det);
  }

  $("search").value = "";
  $("jump").value = "";
  updateSidebarStats();
  updateResultsUI();
}

function setActive(formKey){
  active = formKey;
  setTabSelected(formKey);
  render();
}

function buildExportPayload(formKey){
  const form = FORMS[formKey];
  const st = loadFormState(formKey);
  const answers = st.answers || {};
  return {
    form: { key: form.key, title: form.title, scale: form.scaleLabels },
    meta: st.meta || {nome:"", data:""},
    responses: form.items.map(([n, text]) => ({ n, text, value: answers[n] ?? null }))
  };
}

function exportAllPackage(){
  const pkg = {
    exported_at: new Date().toISOString(),
    forms: Object.keys(FORMS).map(k => buildExportPayload(k))
  };

  const nome = (pkg.forms[0]?.meta?.nome || "sem_nome").trim().replace(/\s+/g,"_");
  const data = pkg.forms[0]?.meta?.data || "sem_data";

  download(`PACOTE_TODOS_${nome}_${data}.json`, JSON.stringify(pkg, null, 2), "application/json");
  toast("Exportado pacote com os 3 formulários (JSON).");
}

function wireEvents(){
  // Tabs
  $("tab-YRAI").addEventListener("click", ()=> setActive("YRAI"));
  $("tab-YCI").addEventListener("click", ()=> setActive("YCI"));
  $("tab-PM2").addEventListener("click", ()=> setActive("PM2"));

  // Meta sync across forms
  $("nome").addEventListener("input", ()=>{
    setMetaToAllForms(FORMS, $("nome").value || "", $("data").value || "");
  });
  $("data").addEventListener("change", ()=>{
    setMetaToAllForms(FORMS, $("nome").value || "", $("data").value || "");
  });

  // Search filter
  $("search").addEventListener("input", (e)=>{
    const q = e.target.value.trim().toLowerCase();
    const rows = document.querySelectorAll(".q");
    rows.forEach(r=>{
      const text = r.querySelector(".txt")?.textContent?.toLowerCase() || "";
      r.style.display = (!q || text.includes(q)) ? "" : "none";
    });
  });

  // Jump
  $("jump").addEventListener("keydown", (e)=>{
    if(e.key !== "Enter") return;
    const num = e.target.value.trim();
    if(!/^\d+$/.test(num)) return;

    const el = document.querySelector(`.q[data-qnum="${num}"]`);
    if(el){
      const det = el.closest("details");
      if(det) det.open = true;

      el.scrollIntoView({behavior:"smooth", block:"center"});
      el.style.outline = "2px solid rgba(78,161,255,.7)";
      el.style.outlineOffset = "6px";
      setTimeout(()=>{ el.style.outline=""; el.style.outlineOffset=""; }, 1200);
    }else{
      toast("Questão não encontrada neste formulário.");
    }
  });

  // Exports
  $("btnExportJson").addEventListener("click", ()=>{
    const payload = buildExportPayload(active);
    const nome = (payload.meta?.nome || "sem_nome").trim().replace(/\s+/g,"_");
    const data = payload.meta?.data || "sem_data";
    download(`${active}_${nome}_${data}.json`, JSON.stringify(payload, null, 2), "application/json");
    toast("JSON exportado.");
  });

  $("btnExportCsv").addEventListener("click", ()=>{
    const payload = buildExportPayload(active);

    const rows = [
      ["form_key","form_title","nome","data","questao_num","questao_texto","resposta_1a6"].join(",")
    ];

    const safe = (s)=> `"${String(s).replaceAll('"','""')}"`;

    for(const r of payload.responses){
      rows.push([
        payload.form.key,
        safe(payload.form.title),
        safe(payload.meta?.nome||""),
        payload.meta?.data || "",
        r.n,
        safe(r.text),
        (r.value ?? "")
      ].join(","));
    }

    const nome = (payload.meta?.nome || "sem_nome").trim().replace(/\s+/g,"_");
    const data = payload.meta?.data || "sem_data";
    download(`${active}_${nome}_${data}.csv`, rows.join("\n"), "text/csv;charset=utf-8");
    toast("CSV exportado.");
  });

  $("btnUpdateResults").addEventListener("click", updateResultsUI);

  $("btnExportResultsPng").addEventListener("click", exportResultsPng);

  $("btnExportAll").addEventListener("click", exportAllPackage);

  $("btnPrint").addEventListener("click", ()=> window.print());

  $("btnClear").addEventListener("click", ()=>{
    const st = loadFormState(active);
    st.answers = {};
    st.meta = { nome: $("nome").value || "", data: $("data").value || "" };
    saveFormState(active, st);
    render();
    toast("Respostas limpas (formulário atual).");
  });
}

wireEvents();
render();
/* =========================
   RESULTADOS PM2/YAMI (médias + gráfico + export PNG)
========================= */

const PM2_CATEGORIES = [
  { key:"DP", label:"DP protetor desligado", from:1, to:25 },
  { key:"VC", label:"VC criança vulnerável", from:26, to:48 },
  { key:"PP", label:"PP pais punitívos", from:49, to:73 },
  { key:"AC", label:"AC criança zangada", from:74, to:85 },
  { key:"HA", label:"HA adulto saudável", from:86, to:112 },
  { key:"CS", label:"CS capitulador complacente", from:113, to:127 },
  { key:"OC", label:"OC hipercompensador", from:128, to:148 },
  { key:"IC", label:"IC criança impulsiva e indisciplinada", from:149, to:158 },
  { key:"DC", label:"DC pais críticos e hiperdemandantes", from:159, to:170 },
  { key:"CC", label:"CC criança feliz", from:171, to:186 },
];

function getPm2Averages(){
  const st = loadFormState("PM2");
  const answers = st.answers || {};

  const rows = PM2_CATEGORIES.map(cat => {
    let sum = 0;
    let count = 0;
    const total = (cat.to - cat.from + 1);

    for(let n=cat.from; n<=cat.to; n++){
      const v = Number(answers[n]);
      if(Number.isFinite(v) && v>=1 && v<=6){
        sum += v;
        count += 1;
      }
    }

    const avg = count ? (sum / count) : 0;
    const missing = total - count;

    return {
      ...cat,
      avg,
      answered: count,
      total,
      missing
    };
  });

  const missingAll = rows.reduce((acc,r)=>acc+r.missing,0);

  return { rows, missingAll };
}

function fmtPt(n){
  // 3 casas como na planilha (2,640)
  return n.toFixed(3).replace(".", ",");
}

function classByAvg(avg){
  // só pra cor do “Resultado” na tabela (não é interpretação clínica)
  if(avg >= 4.0) return "good";
  if(avg >= 2.5) return "mid";
  return "bad";
}

function renderResultsTable(rows){
  // divide em 2 colunas (5 e 5)
  const left = rows.slice(0, 5);
  const right = rows.slice(5, 10);

  const miniTable = (arr) => `
    <table class="results-table-mini">
      <thead>
        <tr>
          <th>Questões</th>
          <th>Resultado</th>
          <th style="text-align:right;">Média</th>
        </tr>
      </thead>
      <tbody>
        ${arr.map(r => `
          <tr>
            <td class="results-range">${r.from} - ${r.to}</td>
            <td>${r.label}</td>
            <td class="results-val ${classByAvg(r.avg)}">${fmtPt(r.avg)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  $("resultsTableWrap").innerHTML = `
    <div class="results-table-two">
      ${miniTable(left)}
      ${miniTable(right)}
    </div>
  `;
}


function drawResultsChart(rows){
  const canvas = $("resultsChart");
  const ctx = canvas.getContext("2d");

  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const W = canvas.width, H = canvas.height;

  // Escala (1..6)
  const xMin = 1;
  const xMax = 6;

  // Layout: espaço grande para rótulos à esquerda
  const padL = 360;   // labels
  const padR = 90;    // espaço para número no fim da barra
  const padT = 24;
  const padB = 26;

  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  // Fundo transparente
  ctx.fillStyle = "rgba(255,255,255,0)";
  ctx.fillRect(0,0,W,H);

  // Grid vertical (marcas 1..6)
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.font = "13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillStyle = "rgba(255,255,255,0.70)";

  for(let t=xMin; t<=xMax; t++){
    const x = padL + (t - xMin) * (plotW/(xMax-xMin));

    // linha
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + plotH);
    ctx.stroke();

    // rótulo embaixo
    const label = fmtPt(t);
    const tw = ctx.measureText(label).width;
    ctx.fillText(label, x - tw/2, padT + plotH + 18);
  }

  // Eixos
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT + plotH);
  ctx.lineTo(padL + plotW, padT + plotH);
  ctx.stroke();

  // Barras
  const n = rows.length;
  const gap = 12;
  const barH = (plotH - gap*(n+1)) / n;

  rows.forEach((r, i) => {
    const y = padT + gap + i*(barH + gap);

    // clamp: se avg < 1, desenha no mínimo 1 (barra zero dentro do plot)
    const v = Math.max(xMin, Math.min(xMax, r.avg));
    const w = (v - xMin) * (plotW/(xMax-xMin));

    const x0 = padL;

    // barra
    ctx.fillStyle = "rgba(160, 112, 255, 0.78)";
    ctx.fillRect(x0, y, w, barH);

    // brilho no início
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x0, y, Math.min(12, w), barH);

    // rótulo da categoria (à esquerda, maior)
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.font = "700 15px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    drawRightAlignedWrapped(ctx, r.label, padL - 14, y + (barH/2) + 5, padL - 28, 18, 2);

    // valor na frente da barra (bem maior)
    const vtxt = fmtPt(r.avg);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "900 16px system-ui, -apple-system, Segoe UI, Roboto, Arial";

    // coloca um pouco depois da ponta da barra; se a barra for curta, garante distância mínima
    const valueX = x0 + w + 10;
    const valueY = y + (barH/2) + 6;
    ctx.fillText(vtxt, Math.min(valueX, padL + plotW + 10), valueY);
  });

  // helper: quebra em até 2 linhas e alinha à direita (para o texto caber bem à esquerda)
  function drawRightAlignedWrapped(ctx, text, rightX, midY, maxWidth, lineHeight, maxLines){
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";

    for(const w of words){
      const test = line ? (line + " " + w) : w;
      if(ctx.measureText(test).width <= maxWidth){
        line = test;
      }else{
        if(line) lines.push(line);
        line = w;
        if(lines.length === maxLines) break;
      }
    }
    if(lines.length < maxLines && line) lines.push(line);

    // reticências se estourar
    if(lines.length === maxLines && words.length){
      let last = lines[maxLines-1];
      while(ctx.measureText(last + "…").width > maxWidth && last.length > 0){
        last = last.slice(0, -1);
      }
      lines[maxLines-1] = last + "…";
    }

    // centraliza verticalmente em relação ao meio da barra
    const totalH = (lines.length - 1) * lineHeight;
    const startY = midY - totalH/2;

    ctx.fillStyle = "rgba(255,255,255,0.88)";
    lines.forEach((ln, idx) => {
      const tw = ctx.measureText(ln).width;
      ctx.fillText(ln, rightX - tw, startY + idx*lineHeight);
    });
  }
}


function updateResultsUI(){
  const show = (active === "PM2");
  $("resultsPanel").style.display = show ? "" : "none";
  if(!show) return;

  const { rows, missingAll } = getPm2Averages();
  renderResultsTable(rows);
  drawResultsChart(rows);

  $("resultsNote").textContent =
    missingAll
      ? `Atenção: faltam ${missingAll} respostas no total para o PM2/YAMI (as médias estão sendo calculadas apenas com as respostas preenchidas).`
      : `Tudo preenchido. As médias são a soma das notas dividida pela quantidade de questões em cada categoria.`;
}

function exportResultsPng(){
  const { rows } = getPm2Averages();

  // Canvas de export (tabela + gráfico)
  const W = 1200;
  const H = 760;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");

  // fundo
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0,0,W,H);

  // título
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 20px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Resultados – PM2/YAMI", 24, 36);

  // tabela (desenho simples)
  const tableX = 24, tableY = 58, tableW = 520;
  const rowH = 28;
  const headH = 30;

  // caixa
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(tableX, tableY, tableW, headH + rowH*rows.length);

  // header
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(tableX, tableY, tableW, headH);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "600 12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Questões", tableX+10, tableY+20);
  ctx.fillText("Resultado", tableX+120, tableY+20);
  ctx.fillText("Média", tableX+tableW-60, tableY+20);

  // linhas
  ctx.font = "13px system-ui, -apple-system, Segoe UI, Roboto, Arial";

  rows.forEach((r, i) => {
    const y = tableY + headH + i*rowH;

    // linha
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.beginPath();
    ctx.moveTo(tableX, y);
    ctx.lineTo(tableX+tableW, y);
    ctx.stroke();

    // texto
    ctx.fillStyle = "rgba(255,255,255,0.70)";
    ctx.fillText(`${r.from} - ${r.to}`, tableX+10, y+19);

    ctx.fillStyle = "rgba(255,255,255,0.90)";
    ctx.fillText(r.label, tableX+120, y+19);

    // célula média destacada (verde) estilo planilha
    const val = fmtPt(r.avg);
    const cellW = 95;
    const cellX = tableX + tableW - cellW - 10;
    ctx.fillStyle = "rgba(34,197,94,0.25)";
    ctx.fillRect(cellX, y+4, cellW, rowH-8);

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "700 13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    const tw = ctx.measureText(val).width;
    ctx.fillText(val, cellX + cellW - tw - 10, y+19);

    ctx.font = "13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  });

  // gráfico: reaproveita o canvas já desenhado, mas em tamanho maior
  const src = $("resultsChart");
  // desenhar “card”
  const chartX = 570, chartY = 58, chartW = 606, chartH = 660;
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(chartX, chartY, chartW, chartH);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.strokeRect(chartX, chartY, chartW, chartH);

  // encaixa o canvas do gráfico dentro do card
  ctx.drawImage(src, chartX+10, chartY+10, chartW-20, chartH-20);

  // baixar
  c.toBlob((blob)=>{
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `resultados_PM2_YAMI_${new Date().toISOString().slice(0,10)}.png`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 2500);
  }, "image/png");
}
