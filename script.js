const arrayContainer = document.getElementById("arrayContainer");
const generateArrayButton = document.getElementById("generateArray");
const sizeSlider = document.getElementById("sizeSlider");
const speedSlider = document.getElementById("speedSlider");
const algorithmSelect = document.getElementById("algorithm");
const sortButton = document.getElementById("sort");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const stepButton = document.getElementById("step");
const customArrayInput = document.getElementById("customArray");
const useCustomArrayButton = document.getElementById("useCustomArray");
const algorithmDescription = document.getElementById("algorithmDescription");
const comparisonsDisplay = document.getElementById("comparisons");
const swapsDisplay = document.getElementById("swaps");
const timeDisplay = document.getElementById("time");

let array = [];
let arraySize = sizeSlider.value;
let delay = 100 - speedSlider.value;
let isSorting = false;
let isPaused = false;
let comparisons = 0;
let swaps = 0;
let startTime;

// Algorithm descriptions
const algorithmDescriptions = {
  bubbleSort: "Bubble Sort repeatedly swaps adjacent elements if they are in the wrong order.",
  selectionSort: "Selection Sort selects the smallest element and swaps it with the first unsorted element.",
  insertionSort: "Insertion Sort builds the final sorted array one element at a time.",
  mergeSort: "Merge Sort divides the array into halves, sorts them, and merges them.",
  quickSort: "Quick Sort picks a pivot and partitions the array around the pivot.",
  heapSort: "Heap Sort builds a heap and repeatedly extracts the maximum element.",
};

// Generate a random array
function generateArray() {
  array = [];
  for (let i = 0; i < arraySize; i++) {
    array.push(Math.floor(Math.random() * 100) + 1);
  }
  renderArray();
}
// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
const gradientTheme = document.getElementById("gradientTheme");
const neonTheme = document.getElementById("neonTheme");
const woodenTheme = document.getElementById("woodenTheme"); // New wooden theme button

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.querySelector("header").classList.toggle("dark-mode");
  document.querySelector("footer").classList.toggle("dark-mode");
  themeToggle.innerHTML = document.body.classList.contains("dark-mode")
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
});

gradientTheme.addEventListener("click", () => {
  if (document.body.classList.contains("gradient-mode")) {
    // If gradient mode is already active, remove it to revert to default
    document.body.classList.remove("gradient-mode");
    document.querySelector("header").classList.remove("gradient-mode");
    document.querySelector("footer").classList.remove("gradient-mode");
  } else {
    // Otherwise, apply gradient mode and remove other themes
    document.body.classList.remove("dark-mode", "neon-mode", "wooden-mode");
    document.body.classList.add("gradient-mode");
    document.querySelector("header").classList.remove("dark-mode", "neon-mode", "wooden-mode");
    document.querySelector("header").classList.add("gradient-mode");
    document.querySelector("footer").classList.remove("dark-mode", "neon-mode", "wooden-mode");
    document.querySelector("footer").classList.add("gradient-mode");
  }
});

neonTheme.addEventListener("click", () => {
  if (document.body.classList.contains("neon-mode")) {
    // If neon mode is already active, remove it to revert to default
    document.body.classList.remove("neon-mode");
    document.querySelector("header").classList.remove("neon-mode");
    document.querySelector("footer").classList.remove("neon-mode");
  } else {
    // Otherwise, apply neon mode and remove other themes
    document.body.classList.remove("dark-mode", "gradient-mode", "wooden-mode");
    document.body.classList.add("neon-mode");
    document.querySelector("header").classList.remove("dark-mode", "gradient-mode", "wooden-mode");
    document.querySelector("header").classList.add("neon-mode");
    document.querySelector("footer").classList.remove("dark-mode", "gradient-mode", "wooden-mode");
    document.querySelector("footer").classList.add("neon-mode");
  }
});

// Wooden Theme Toggle
woodenTheme.addEventListener("click", () => {
  if (document.body.classList.contains("wooden-mode")) {
    // If wooden mode is already active, remove it to revert to default
    document.body.classList.remove("wooden-mode");
    document.querySelector("header").classList.remove("wooden-mode");
    document.querySelector("footer").classList.remove("wooden-mode");
  } else {
    // Otherwise, apply wooden mode and remove other themes
    document.body.classList.remove("dark-mode", "gradient-mode", "neon-mode");
    document.body.classList.add("wooden-mode");
    document.querySelector("header").classList.remove("dark-mode", "gradient-mode", "neon-mode");
    document.querySelector("header").classList.add("wooden-mode");
    document.querySelector("footer").classList.remove("dark-mode", "gradient-mode", "neon-mode");
    document.querySelector("footer").classList.add("wooden-mode");
  }
});

// Render the array as bars
function renderArray(highlightIndices = [], swapIndices = [], sortedIndices = []) {
  arrayContainer.innerHTML = "";
  for (let i = 0; i < array.length; i++) {
    const bar = document.createElement("div");
    bar.className = "arrayBar";
    bar.style.height = `${array[i]}%`;
    if (highlightIndices.includes(i)) {
      bar.classList.add("comparing");
    }
    if (swapIndices.includes(i)) {
      bar.classList.add("swapping");
    }
    if (sortedIndices.includes(i)) {
      bar.classList.add("sorted");
    }
    arrayContainer.appendChild(bar);
  }
}

// Swap two elements in the array
const swapSound = new Audio("swap.wav");
const compareSound = new Audio("compare.wav");

async function swap(i, j) {
  [array[i], array[j]] = [array[j], array[i]];
  swaps++;
  swapsDisplay.textContent = swaps;
  renderArray([], [i, j]);
  swapSound.play();
  await sleep(delay);
}

// Sleep function for visualization
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Pause functionality
function pause() {
  return new Promise((resolve) => {
    const resumeButton = document.getElementById("pause");
    resumeButton.textContent = "Resume";

    // Create a one-time event listener for the "Resume" button
    const resumeHandler = () => {
      isPaused = false;
      resumeButton.textContent = "Pause";
      resolve();
      resumeButton.removeEventListener("click", resumeHandler); // Remove the listener after resolving
    };

    resumeButton.addEventListener("click", resumeHandler);
  });
}

// Reset functionality
function reset() {
  isSorting = false;
  isPaused = false;
  comparisons = 0;
  swaps = 0;
  comparisonsDisplay.textContent = comparisons;
  swapsDisplay.textContent = swaps;
  timeDisplay.textContent = 0;
  generateArray();
}

// Bubble Sort
async function bubbleSort() {
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (isPaused) {
        await pause(); // Pause if the sorting is paused
      }
      comparisons++;
      comparisonsDisplay.textContent = comparisons;
      renderArray([j, j + 1]);
      compareSound.play();
      await sleep(delay);
      if (array[j] > array[j + 1]) {
        await swap(j, j + 1);
      }
    }
    renderArray([], [], [array.length - i - 1]);
  }
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}

// Selection Sort
async function selectionSort() {
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      if (isPaused) {
        await pause();
      }
      comparisons++;
      comparisonsDisplay.textContent = comparisons;
      renderArray([j, minIndex]);
      compareSound.play();
      await sleep(delay);
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      await swap(i, minIndex);
    }
    renderArray([], [], [i]);
  }
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}

// Insertion Sort
async function insertionSort() {
  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      if (isPaused) {
        await pause();
      }
      comparisons++;
      comparisonsDisplay.textContent = comparisons;
      renderArray([j, j + 1]);
      compareSound.play();
      await sleep(delay);
      array[j + 1] = array[j];
      j--;
    }
    array[j + 1] = key;
    renderArray([], [], [j + 1]);
    await sleep(delay);
  }
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}

// Merge Sort
async function mergeSort() {
  await mergeSortHelper(0, array.length - 1);
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}

async function mergeSortHelper(low, high) {
  if (low < high) {
    const mid = Math.floor((low + high) / 2);
    await mergeSortHelper(low, mid);
    await mergeSortHelper(mid + 1, high);
    await merge(low, mid, high);
  }
}

async function merge(low, mid, high) {
  const temp = [];
  let i = low,
    j = mid + 1;
  while (i <= mid && j <= high) {
    if (isPaused) {
      await pause();
    }
    comparisons++;
    comparisonsDisplay.textContent = comparisons;
    renderArray([i, j]);
    compareSound.play();
    await sleep(delay);
    if (array[i] <= array[j]) {
      temp.push(array[i++]);
    } else {
      temp.push(array[j++]);
    }
  }
  while (i <= mid) temp.push(array[i++]);
  while (j <= high) temp.push(array[j++]);
  for (let k = low; k <= high; k++) {
    array[k] = temp[k - low];
    renderArray([], [], [k]);
    await sleep(delay);
  }
}

// Quick Sort
async function quickSort() {
  await quickSortHelper(0, array.length - 1);
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}

async function quickSortHelper(low, high) {
  if (low < high) {
    const pivotIndex = await partition(low, high);
    await quickSortHelper(low, pivotIndex - 1);
    await quickSortHelper(pivotIndex + 1, high);
  }
}

async function partition(low, high) {
  const pivot = array[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (isPaused) {
      await pause();
    }
    comparisons++;
    comparisonsDisplay.textContent = comparisons;
    renderArray([j, high]);
    compareSound.play();
    await sleep(delay);
    if (array[j] < pivot) {
      i++;
      await swap(i, j);
    }
  }
  await swap(i + 1, high);
  return i + 1;
}

// Heap Sort
async function heapSort() {
  const n = array.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    await swap(0, i);
    await heapify(i, 0);
  }
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}

async function heapify(n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && array[left] > array[largest]) {
    largest = left;
  }
  if (right < n && array[right] > array[largest]) {
    largest = right;
  }
  if (largest !== i) {
    await swap(i, largest);
    await heapify(n, largest);
  }
}

// Event Listeners
generateArrayButton.addEventListener("click", generateArray);
sizeSlider.addEventListener("input", () => {
  arraySize = sizeSlider.value;
  generateArray();
});
speedSlider.addEventListener("input", () => {
  delay = 100 - speedSlider.value;
});
algorithmSelect.addEventListener("change", () => {
  algorithmDescription.textContent = algorithmDescriptions[algorithmSelect.value];
});
sortButton.addEventListener("click", async () => {
  if (isSorting) return; // Prevent multiple clicks
  isSorting = true;
  comparisons = 0;
  swaps = 0;
  timeDisplay.textContent = 0;
  comparisonsDisplay.textContent = comparisons;
  swapsDisplay.textContent = swaps;
  startTime = performance.now();
  const algorithm = algorithmSelect.value;
  switch (algorithm) {
    case "bubbleSort":
      await bubbleSort();
      break;
    case "selectionSort":
      await selectionSort();
      break;
    case "insertionSort":
      await insertionSort();
      break;
    case "mergeSort":
      await mergeSort();
      break;
    case "quickSort":
      await quickSort();
      break;
    case "heapSort":
      await heapSort();
      break;
    default:
      alert("Invalid algorithm selected.");
  }
  const endTime = performance.now();
  timeDisplay.textContent = Math.floor(endTime - startTime);
  isSorting = false; // Reset sorting flag
});
pauseButton.addEventListener("click", () => {
  if (isSorting) {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
  }
});
resetButton.addEventListener("click", () => {
  reset();
});
useCustomArrayButton.addEventListener("click", () => {
  if (isSorting) return;
  const customArray = customArrayInput.value
    .split(",")
    .map((num) => parseInt(num.trim()))
    .filter((num) => !isNaN(num));
  if (customArray.length >= 5 && customArray.length <= 100) {
    array = customArray;
    arraySize = array.length;
    sizeSlider.value = arraySize;
    renderArray();
  } else {
    alert("Custom array must have between 5 and 100 elements.");
  }
});

// Initialize
generateArray();
algorithmDescription.textContent = algorithmDescriptions[algorithmSelect.value];