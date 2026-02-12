const LANG = window.LANG || {
  participantsCount: (n) => `Suma uczestników: ${n}`,
  modeHintGroups: "Podaj liczbę grup:",
  modeHintSize: "Podaj liczbę osób w grupie:",
  shuffleRangeError: "Liczba mieszań musi być w zakresie 1–10.",
  valueError: "Wartość musi być liczbą większą od 0.",
  emptyError: "Dodaj co najmniej jednego uczestnika.",
  tooManyGroupsError: "Liczba grup nie może przekraczać liczby uczestników.",
  groupLabel: (label) => `Grupa ${label}`,
  groupLabelTime: (label, time) => `Grupa ${label} — ${time}`,
  csvHeaders: ["Grupa", "Pozycja startowa", "Uczestnik"],
  exportImageError: "Nie udało się wygenerować obrazu.",
  exportPdfError: "Nie udało się wygenerować PDF.",
  shuffleFirst: "Najpierw wykonaj losowanie.",
  csvNoHeaders: "Brak nagłówków w pliku CSV.",
  csvNoData: "Plik CSV nie zawiera danych.",
  csvReadError: "Nie udało się odczytać pliku CSV.",
  csvEmptyHeader: "(puste)",
  csvPreviewInfo: "Podgląd CSV (nagłówki + 3 wiersze).",
  csvSelectColumn: "Wybierz kolumnę z danymi uczestników (np. imię i nazwisko):",
  csvRemainingRows: (n) => `Pozostało jeszcze ${n} wierszy.`,
  csvAllRows: "To wszystkie wiersze w pliku.",
  csvColumnFallback: (n) => `Kolumna ${n}`,
  defaultFilename: "lista-startowa",
};

const participantsEl = document.getElementById("participants");
const modeValueEl = document.getElementById("modeValue");
const modeHintEl = document.getElementById("modeHint");
const shuffleBtn = document.getElementById("shuffleBtn");
const csvBtn = document.getElementById("csvBtn");
const pdfBtn = document.getElementById("pdfBtn");
const pngBtn = document.getElementById("pngBtn");
const exportActionsEl = document.getElementById("exportActions");
const errorEl = document.getElementById("error");
const resultsContainer = document.getElementById("resultsContainer");
const participantsCountEl = document.getElementById("participantsCount");
const csvInputEl = document.getElementById("csvInput");
const csvPreviewEl = document.getElementById("csvPreview");
const csvModalEl = document.getElementById("csvModal");
const applyCsvBtn = document.getElementById("applyCsvBtn");
const resultsSection = document.getElementById("resultsSection");
const groupLabelModeEl = document.getElementById("groupLabelMode");
const shuffleCountEl = document.getElementById("shuffleCount");
const shuffleStatusEl = document.getElementById("shuffleStatus");
const scheduleEnabledEl = document.getElementById("scheduleEnabled");
const startTimeEl = document.getElementById("startTime");
const intervalMinutesEl = document.getElementById("intervalMinutes");
const eventNameEl = document.getElementById("eventName");
const eventDateEl = document.getElementById("eventDate");
const eventMetaEl = document.getElementById("eventMeta");

let csvHeaders = [];
let csvRows = [];
let csvSelectedColumn = 0;

let currentGroupLabels = [];
let currentGroupTimes = [];

let currentGroups = [];

function getMode() {
  return document.querySelector("input[name='mode']:checked").value;
}

function setError(message) {
  errorEl.textContent = message || "";
}

function parseParticipants(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function updateParticipantsCount() {
  const count = parseParticipants(participantsEl.value).length;
  participantsCountEl.textContent = LANG.participantsCount(count);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function shuffleTimes(list, times) {
  const value = Number.parseInt(times, 10);
  if (Number.isNaN(value) || value < 1 || value > 10) {
    throw new Error(LANG.shuffleRangeError);
  }
  const result = [...list];
  for (let i = 0; i < value; i += 1) {
    shuffle(result);
  }
  return result;
}

function setShuffling(isShuffling) {
  shuffleBtn.disabled = isShuffling;
  shuffleStatusEl.classList.toggle("hidden", !isShuffling);
}

function splitIntoGroups(list, mode, value) {
  if (value < 1 || Number.isNaN(value)) {
    throw new Error(LANG.valueError);
  }

  const total = list.length;
  if (total === 0) {
    throw new Error(LANG.emptyError);
  }

  let groupCount = value;
  if (mode === "size") {
    groupCount = Math.ceil(total / value);
  }

  if (groupCount > total) {
    throw new Error(LANG.tooManyGroupsError);
  }

  const baseSize = Math.floor(total / groupCount);
  const remainder = total % groupCount;

  const groups = [];
  let index = 0;

  for (let i = 0; i < groupCount; i += 1) {
    const size = baseSize + (i < remainder ? 1 : 0);
    groups.push(list.slice(index, index + size));
    index += size;
  }

  return groups;
}

function renderGroups(groups) {
  resultsContainer.innerHTML = "";
  if (groups.length === 0) {
    setExportVisibility(false);
    resultsSection.classList.add("hidden");
    return;
  }

  resultsSection.classList.remove("hidden");
  const cols = Math.min(4, Math.max(1, groups.length));
  resultsContainer.style.setProperty("--cols", String(cols));

  groups.forEach((group, index) => {
    const col = document.createElement("div");
    col.className = "result-col";

    const card = document.createElement("div");
    card.className = "card h-100";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const title = document.createElement("h3");
    const label = currentGroupLabels[index] || index + 1;
    const time = currentGroupTimes[index];
    title.className = "h6 card-title";
    title.textContent = time
      ? LANG.groupLabelTime(label, time)
      : LANG.groupLabel(label);
    cardBody.appendChild(title);

    const list = document.createElement("ol");
    list.className = "mb-0";
    group.forEach((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      list.appendChild(li);
    });
    cardBody.appendChild(list);
    card.appendChild(cardBody);
    col.appendChild(card);

    resultsContainer.appendChild(col);
  });
  setExportVisibility(true);
}

function setExportVisibility(isVisible) {
  exportActionsEl.classList.toggle("hidden", !isVisible);
}

function updateEventMeta() {
  const name = eventNameEl.value.trim();
  const date = eventDateEl.value;
  if (!name && !date) {
    eventMetaEl.textContent = "";
    return;
  }
  const parts = [];
  if (name) {
    parts.push(name);
  }
  if (date) {
    parts.push(date);
  }
  eventMetaEl.textContent = parts.join(" — ");
}

function buildCsv(groups) {
  const rows = [LANG.csvHeaders];
  groups.forEach((group, groupIndex) => {
    group.forEach((name, position) => {
      const label = currentGroupLabels[groupIndex] || groupIndex + 1;
      const time = currentGroupTimes[groupIndex];
      const groupValue = time ? `${label} (${time})` : label;
      rows.push([groupValue, position + 1, name]);
    });
  });

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function csvEscape(value) {
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function buildExportFilename(ext) {
  const name = eventNameEl.value.trim();
  const date = eventDateEl.value.trim();
  const parts = [];
  if (name) {
    parts.push(slugify(name));
  }
  if (date) {
    parts.push(date);
  }
  const base = parts.filter(Boolean).join("-");
  return `${base || LANG.defaultFilename}.${ext}`;
}

async function renderToCanvas() {
  const targetWidth = Math.ceil(resultsSection.getBoundingClientRect().width);
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.style.padding = "24px";
  wrapper.style.background = "#ffffff";
  wrapper.style.width = `${targetWidth}px`;
  wrapper.classList.add("exporting");

  const clone = resultsSection.cloneNode(true);
  clone.style.width = "100%";
  wrapper.appendChild(clone);

  document.body.appendChild(wrapper);
  try {
    return await window.html2canvas(wrapper, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
  } finally {
    document.body.removeChild(wrapper);
  }
}

async function exportImage() {
  if (currentGroups.length === 0) {
    setError(LANG.shuffleFirst);
    return;
  }
  setError("");
  try {
    const canvas = await renderToCanvas();
    const dataUrl = canvas.toDataURL("image/png");
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    downloadFile(blob, buildExportFilename("png"));
  } catch (error) {
    setError(LANG.exportImageError);
  }
}

async function exportPdf() {
  const { PDFDocument, PageSizes } = window.PDFLib;
  const pdfDoc = await PDFDocument.create();

  const canvas = await renderToCanvas();
  const dataUrl = canvas.toDataURL("image/png");
  const pngBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
  const pngImage = await pdfDoc.embedPng(pngBytes);

  const [pageWidth, pageHeight] = PageSizes.A4;
  const margin = 28.35;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const { width, height } = pngImage.size();
  const maxWidth = pageWidth - margin * 2;
  const scale = Math.min(maxWidth / width, 1);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  const x = (pageWidth - drawWidth) / 2;
  const y = pageHeight - margin - drawHeight;

  page.drawImage(pngImage, {
    x,
    y,
    width: drawWidth,
    height: drawHeight,
  });

  const pdfBytes = await pdfDoc.save();
  downloadFile(
    new Blob([pdfBytes], { type: "application/pdf" }),
    buildExportFilename("pdf")
  );
}

function hideCsvInput() {
  csvInputEl.classList.add("d-none");
  const label = document.querySelector("label[for='csvInput']");
  if (label) {
    label.classList.add("d-none");
  }
}

function showCsvInput() {
  csvInputEl.classList.remove("d-none");
  const label = document.querySelector("label[for='csvInput']");
  if (label) {
    label.classList.remove("d-none");
  }
}

function parseCsv(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

function renderCsvPreview(headers, rows) {
  if (!headers || headers.length === 0) {
    csvPreviewEl.classList.remove("hidden");
    csvPreviewEl.textContent = LANG.csvNoHeaders;
    return;
  }

  csvHeaders = headers;
  csvRows = rows;
  csvSelectedColumn = 0;

  const previewRows = rows.slice(0, 3);
  const remainingCount = Math.max(0, rows.length - previewRows.length);
  const table = document.createElement("table");
  table.className = "table table-sm table-bordered mb-2";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const headerCells = [];
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header || LANG.csvEmptyHeader;
    headRow.appendChild(th);
    headerCells.push(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const bodyRows = [];
  previewRows.forEach((row) => {
    const tr = document.createElement("tr");
    const cells = [];
    headers.forEach((_, index) => {
      const td = document.createElement("td");
      td.textContent = row[index] || "";
      tr.appendChild(td);
      cells.push(td);
    });
    tbody.appendChild(tr);
    bodyRows.push(cells);
  });
  table.appendChild(tbody);

  const select = document.createElement("select");
  select.className = "form-select form-select-sm mt-2";
  headers.forEach((header, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = header || LANG.csvColumnFallback(index + 1);
    select.appendChild(option);
  });

  const info = document.createElement("div");
  info.textContent = LANG.csvPreviewInfo;
  const selectLabel = document.createElement("div");
  selectLabel.textContent = LANG.csvSelectColumn;
  const moreInfo = document.createElement("div");
  moreInfo.textContent = remainingCount
    ? LANG.csvRemainingRows(remainingCount)
    : LANG.csvAllRows;

  csvPreviewEl.innerHTML = "";
  csvPreviewEl.classList.remove("hidden");
  csvPreviewEl.appendChild(info);
  csvPreviewEl.appendChild(table);
  csvPreviewEl.appendChild(moreInfo);
  csvPreviewEl.appendChild(selectLabel);
  csvPreviewEl.appendChild(select);

  const highlightColumn = (index) => {
    headerCells.forEach((cell, i) => {
      cell.classList.toggle("highlight", i === index);
    });
    bodyRows.forEach((cells) => {
      cells.forEach((cell, i) => {
        cell.classList.toggle("highlight", i === index);
      });
    });
  };

  highlightColumn(csvSelectedColumn);

  select.addEventListener("change", () => {
    csvSelectedColumn = Number.parseInt(select.value, 10);
    highlightColumn(csvSelectedColumn);
  });

  applyCsvBtn.disabled = false;
  hideCsvInput();
}

function buildGroupLabels(count) {
  const mode = groupLabelModeEl.value;
  if (mode === "letters") {
    const labels = [];
    for (let i = 0; i < count; i += 1) {
      let n = i;
      let label = "";
      do {
        label = String.fromCharCode(65 + (n % 26)) + label;
        n = Math.floor(n / 26) - 1;
      } while (n >= 0);
      labels.push(label);
    }
    return labels;
  }
  return Array.from({ length: count }, (_, i) => String(i + 1));
}

function buildGroupTimes(count) {
  if (!scheduleEnabledEl.checked) {
    return Array.from({ length: count }, () => "");
  }
  const start = startTimeEl.value;
  const interval = Number.parseInt(intervalMinutesEl.value, 10);
  if (!start || Number.isNaN(interval) || interval < 1) {
    return Array.from({ length: count }, () => "");
  }
  const [hours, minutes] = start.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;
  const result = [];
  for (let i = 0; i < count; i += 1) {
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    result.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    totalMinutes += interval;
  }
  return result;
}

/* --- Event listeners & initialization --- */

function onModeChange() {
  const mode = getMode();
  if (mode === "groups") {
    modeHintEl.textContent = LANG.modeHintGroups;
    modeValueEl.value = "2";
  } else {
    modeHintEl.textContent = LANG.modeHintSize;
    modeValueEl.value = "4";
  }
}

document.querySelectorAll("input[name='mode']").forEach((input) => {
  input.addEventListener("change", onModeChange);
});

participantsEl.addEventListener("input", updateParticipantsCount);
eventNameEl.addEventListener("input", updateEventMeta);
eventDateEl.addEventListener("change", updateEventMeta);

csvInputEl.addEventListener("change", async (event) => {
  setError("");
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }
  try {
    applyCsvBtn.disabled = true;
    showCsvInput();
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length < 2) {
      csvPreviewEl.classList.remove("hidden");
      csvPreviewEl.textContent = LANG.csvNoData;
      return;
    }
    const [headers, ...dataRows] = rows;
    renderCsvPreview(headers, dataRows);
  } catch (error) {
    csvPreviewEl.classList.remove("hidden");
    csvPreviewEl.textContent = LANG.csvReadError;
  }
});

applyCsvBtn.addEventListener("click", () => {
  if (csvRows.length === 0) {
    return;
  }
  const names = csvRows
    .map((row) => row[csvSelectedColumn])
    .filter((value) => value && value.trim().length > 0);
  participantsEl.value = names.join("\n");
  updateParticipantsCount();
  const modalInstance = window.bootstrap.Modal.getInstance(csvModalEl);
  if (modalInstance) {
    modalInstance.hide();
  }
});

shuffleBtn.addEventListener("click", () => {
  setError("");
  setShuffling(true);
  window.setTimeout(() => {
    try {
      const participants = parseParticipants(participantsEl.value);
      const mode = getMode();
      const value = Number.parseInt(modeValueEl.value, 10);
      const shuffled = shuffleTimes(participants, shuffleCountEl.value);
      currentGroups = splitIntoGroups(shuffled, mode, value);
      currentGroupLabels = buildGroupLabels(currentGroups.length);
      currentGroupTimes = buildGroupTimes(currentGroups.length);
      renderGroups(currentGroups);
    } catch (error) {
      currentGroups = [];
      currentGroupLabels = [];
      currentGroupTimes = [];
      renderGroups(currentGroups);
      setError(error.message);
    } finally {
      setShuffling(false);
    }
  }, 150);
});

csvBtn.addEventListener("click", () => {
  setError("");
  if (currentGroups.length === 0) {
    setError(LANG.shuffleFirst);
    return;
  }
  const csv = buildCsv(currentGroups);
  downloadFile(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    buildExportFilename("csv")
  );
});

pdfBtn.addEventListener("click", async () => {
  setError("");
  if (currentGroups.length === 0) {
    setError(LANG.shuffleFirst);
    return;
  }
  try {
    await exportPdf();
  } catch (error) {
    setError(LANG.exportPdfError);
  }
});

pngBtn.addEventListener("click", () => {
  exportImage();
});

onModeChange();
updateParticipantsCount();
setExportVisibility(false);
resultsSection.classList.add("hidden");
updateEventMeta();
