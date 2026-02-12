export const $ = (id) => document.getElementById(id);

/* Toast visual */
export function toast(msg){
  const el = $("toast");
  el.textContent = msg;
  el.style.display = "block";

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>{
    el.style.display = "none";
  }, 1800);
}

/* Escape HTML */
export function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* Storage key */
export function storageKey(formKey){
  return `young_forms_${formKey}_v1`;
}

/* Load */
export function loadFormState(formKey){
  try{
    const raw = localStorage.getItem(storageKey(formKey));
    if(!raw) return { meta:{nome:"", data:""}, answers:{} };
    return JSON.parse(raw);
  }catch{
    return { meta:{nome:"", data:""}, answers:{} };
  }
}

/* Save */
export function saveFormState(formKey, state){
  localStorage.setItem(storageKey(formKey), JSON.stringify(state));
}

/* Sync meta */
export function setMetaToAllForms(forms, nome, data){
  for(const k of Object.keys(forms)){
    const st = loadFormState(k);
    st.meta = { nome, data };
    saveFormState(k, st);
  }
}

/* Progress */
export function answeredCount(forms, formKey){
  const st = loadFormState(formKey);
  const total = forms[formKey].items.length;
  const answered =
    Object.values(st.answers || {})
      .filter(v => v>=1 && v<=6).length;

  return {
    answered,
    total,
    pct: total ? Math.round((answered/total)*100) : 0
  };
}

/* Group questions */
export function groupItems(items, groupSize){
  const groups = [];

  for(let i=0; i<items.length; i+=groupSize){
    const chunk = items.slice(i, i+groupSize);

    groups.push({
      label: `Questões ${chunk[0][0]}–${chunk[chunk.length-1][0]}`,
      items: chunk
    });
  }

  return groups;
}

/* Download helper */
export function download(filename, content, mime="application/octet-stream"){
  const blob = new Blob([content], {type:mime});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
