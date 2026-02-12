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
