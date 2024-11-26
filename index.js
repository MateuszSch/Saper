// // stworzyć inputy i przycisk

// // Struktura danych
// const boardData = [
//   // {
//   //   id: "1-1",
//   //   value: null, // albo 1,2,3
//   //   isBomb: false,
//   //   isQuestionMarked: false,
//   //   isBombMarked: false,
//   //   isVisible: false,
//   // },
// ];
// // zmienić na klasę
// class GameElement {
//   constructor(id, value, isBomb, isBombMarked, isBombMarked, isVisible) {
//     this.id = id;
//     this.value = value;
//     this.isBomb = false;
//     this.isQuestionMarked = false;
//     this.isBombMarked = false;
//     this.isVisible = false;
//   }
//   // position: "1-1",
//   // value: null, // albo 1,2,3
//   // isBomb: false,
//   // isQuestionMark: false,
//   // isBombMarked: false,
//   // isVisible: false,
// }

// cell.id = '1-1'

let isBoardRendered = false;
let isGameRunning = false;
let bombsPlaced = false;
const boardData = [];

const showBoardValues = () => {
  const height = parseInt(document.getElementById("heightInput").value);
  const width = parseInt(document.getElementById("widthInput").value);

  // Przechodzimy po całej planszy
  for (let row = 1; row <= height; row++) {
    for (let col = 1; col <= width; col++) {
      const img = document.getElementById(`${row}-${col}`);

      // Sprawdzamy, czy komórka zawiera bombę
      if (img.classList.contains("isBomb")) {
        boardData.push({ position: `${row}-${col}`, value: "bomb" });
      } else {
        // Pobieramy wartość liczby sąsiednich bomb
        const bombCount = img.getAttribute("data-bombs");
        boardData.push({ position: `${row}-${col}`, value: bombCount });
      }
    }
  }

  // Wyświetlamy wynik w konsoli
  console.log(boardData);
};

const calculateBoardValues = () => {
  const height = parseInt(document.getElementById("heightInput").value);
  const width = parseInt(document.getElementById("widthInput").value);

  // Przechodzimy po całej planszy
  for (let row = 1; row <= height; row++) {
    for (let col = 1; col <= width; col++) {
      const img = document.getElementById(`${row}-${col}`);

      // Jeśli komórka zawiera bombę, pomijamy
      if (img.classList.contains("isBomb")) {
        continue;
      }

      // Liczba sąsiednich bomb
      let bombCount = 0;

      // Sprawdzamy sąsiednie komórki (8 kierunków)
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          // Pomijamy samą komórkę
          if (di === 0 && dj === 0) continue;

          let newRow = row + di;
          let newCol = col + dj;

          // Sprawdzamy, czy sąsiednia komórka znajduje się w obrębie planszy
          if (
            newRow >= 1 &&
            newRow <= height &&
            newCol >= 1 &&
            newCol <= width
          ) {
            const newImg = document.getElementById(`${newRow}-${newCol}`);
            if (newImg && newImg.classList.contains("isBomb")) {
              bombCount++;
            }
          }
        }
      }

      img.setAttribute("data-bombs", bombCount);
    }
  }
  showBoardValues();
};

const placeMines = () => {
  const height = document.getElementById("heightInput").value;
  const width = document.getElementById("widthInput").value;
  const bombCount = document.getElementById("bombCountInput").value;
  for (let minesPlaced = 0; minesPlaced < bombCount; ) {
    const i = Math.floor(Math.random() * height) + 1;
    const j = Math.floor(Math.random() * width) + 1;
    const bombPosition = document.getElementById(`${i}-${j}`);
    if (
      bombPosition &&
      !bombPosition.classList.contains("isBomb") &&
      !bombPosition.classList.contains("firstTarget")
    ) {
      bombPosition.classList.add("isBomb");
      minesPlaced++;
    }
  }
  bombsPlaced = true;
  calculateBoardValues();
};

const renderCellContent = (nearBombs) => {};

const checkNearFields = (row, col) => {
  const height = parseInt(document.getElementById("heightInput").value);
  const width = parseInt(document.getElementById("widthInput").value);

  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 1; dj++) {
      // Pomijamy samą komórkę
      if (di === 0 && dj === 0) continue;

      let newRow = +row + di;
      let newCol = +col + dj;

      // Sprawdzamy, czy sąsiednia komórka znajduje się w obrębie planszy
      const isNearCell =
        newRow >= 1 && newRow <= height && newCol >= 1 && newCol <= width;
      if (isNearCell) {
        const cellId = `${newRow}-${newCol}`;
        const cellImg = document.getElementById(cellId);
        const nearBombs = cellImg.getAttribute("data-bombs");
        const isEmptyShow = cellImg.getAttribute("src") === "img/puste.png";

        if (nearBombs == 0 && !isEmptyShow) {
          cellImg.setAttribute("src", "img/puste.png");
          setTimeout(() => {
            checkNearFields(newRow, newCol);
          }, 0);
        }
        if (nearBombs >= 1) {
          const hasContent = document
            .getElementById(`div-${cellId}`)
            .textContent.trim();

          cellImg.classList.add("hiden");

          if (!hasContent) {
            const div = document.getElementById(`div-${cellImg.id}`);
            const p = document.createElement("p");
            p.textContent = nearBombs;
            div.append(p);
          }
        }
      }
    }
  }
  //   }
  // }
};

const clickImg = (event) => {
  if (!bombsPlaced) {
    const clickedImg = event.target;
    clickedImg.classList.add("firstTarget");
    placeMines();
  }
  // TODO: lewy czy prawy klik

  const clickedImg = event.target;
  const nearBombs = clickedImg.getAttribute("data-bombs");
  const row = clickedImg.getAttribute("id").split("-")[0];
  const col = clickedImg.getAttribute("id").split("-")[1];

  console.log(row, col, clickedImg);

  // TODO odsłanienie sąsiednich pól
  if (nearBombs == null) {
    clickedImg.setAttribute("src", "img/bomb.PNG");
  }
  if (nearBombs == 0) {
    clickedImg.setAttribute("src", "img/puste.png");
    checkNearFields(row, col);
  }
  if (nearBombs >= 1) {
    clickedImg.classList.add("hiden");
    const div = document.getElementById(`div-${clickedImg.id}`);
    const p = document.createElement("p");
    p.textContent = nearBombs;
    div.append(p);
  }
};
const renderBoard = (height, width) => {
  if (isBoardRendered) {
    return;
  }

  const board = document.createElement("div");
  board.id = "board";

  for (i = 1; i <= height; i++) {
    const row = document.createElement("div");
    row.classList.add("row");

    // TODO: rozbić na osobną funkcję
    for (j = 1; j <= width; j++) {
      const div = document.createElement("div");
      div.classList.add("cell");
      div.id = `div-${i}-${j}`;
      div.textContent = " ";
      const img = document.createElement("img");
      img.id = `${i}-${j}`;
      img.setAttribute("src", "img/klepa.PNG");
      img.addEventListener("click", clickImg);
      div.append(img);
      //row.append(img);
      row.append(div);
    }

    board.append(row);
  }

  // TODO append board to container
  document.body.append(board);
  isBoardRendered = true;
};

const startGame = () => {
  const height = document.getElementById("heightInput").value;
  const width = document.getElementById("widthInput").value;
  const bombCount = document.getElementById("bombCountInput").value;

  renderBoard(height, width, bombCount);
};

const renderMenu = () => {
  const heightLabel = document.createElement("label");
  heightLabel.textContent = "Wysokość:";

  const heightInput = document.createElement("input");
  heightInput.id = "heightInput";

  const widhtLabel = document.createElement("label");
  widhtLabel.textContent = "Szerokość:";

  const widthInput = document.createElement("input");
  widthInput.id = "widthInput";

  const bombCountLabel = document.createElement("label");
  bombCountLabel.textContent = "Ilość bomb:";

  const bombCountInput = document.createElement("input");
  bombCountInput.id = "bombCountInput";

  const submitButton = document.createElement("button");
  submitButton.id = "submitButton";
  submitButton.textContent = "Generuj";
  submitButton.addEventListener("click", startGame);

  const container = document.createElement("div");
  container.id = "container";

  container.append(
    heightLabel,
    heightInput,
    widhtLabel,
    widthInput,
    bombCountLabel,
    bombCountInput,
    submitButton
  );

  document.body.append(container);
};

renderMenu();

// wypełnić tablice wartościami
// logika gry z zamianami img
