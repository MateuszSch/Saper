let isBoardRendered = false;
let isGameRunning = false;
let bombsPlaced = false;
let gameIsEnd = false;
const boardData = [];

const username = prompt("Podaj swoją nazwę użytkownika");

const saveWin = () => {
  const time = document.getElementById("showTime").textContent;
  const height = document.getElementById("heightInput").value;
  const width = document.getElementById("widthInput").value;
  const bombCount = document.getElementById("bombCountInput").value;
  const gameMode = `${height}x${width}x${bombCount}`;

  const previesWins = document.cookie
    .split(";")
    .find((cookie) => cookie.includes("wins"));

  if (previesWins) {
    const wins = JSON.parse(previesWins.split("=")[1]);
    wins.push({ username, time, gameMode });
    document.cookie = `wins=${JSON.stringify(wins)}`;
  } else {
    document.cookie = `wins=${JSON.stringify([{ username, time, gameMode }])}`;
  }
};

const calculateWin = (bombsLeft) => {
  if (!bombsLeft) {
    const imgs = document.querySelectorAll("img");
    const bombCount = document.getElementById("bombCountInput").value;
    let bomsFlaged = 0;

    imgs.forEach((element) => {
      const hasFlag = element.classList.contains("isFlaged");
      const hasBomb = element.classList.contains("isBomb");

      if (hasFlag && hasBomb) {
        bomsFlaged++;
      }
    });

    console.log({ bombCount, bomsFlaged });

    if (bomsFlaged == bombCount) {
      alert("Wygrałeś");
      imgs.forEach((element) => {
        const hasBomb = element.classList.contains("isBomb");
        if (hasBomb) {
          element.setAttribute("src", "img/pbomb.PNG");
        }
      });
      gameIsEnd = true;
      saveWin();
      return;
    }

    const winableElements = new Array(imgs).filter(
      (element) =>
        element.getAttribute("src") == "img/klepa.PNG" ||
        element.getAttribute("src") == "img/flaga.PNG"
    );
    const isWinByMix = winableElements.every((element) =>
      element.classList.contains("isBomb")
    );

    console.log({ winableElements, isWinByMix });

    if (isWinByMix) {
      alert("Wygrałeś");
      imgs.forEach((element) => {
        const hasBomb = element.classList.contains("isBomb");
        if (hasBomb) {
          element.setAttribute("src", "img/pbomb.PNG");
        }
      });
      gameIsEnd = true;
      saveWin();
      return;
    }
  }
};

const showBoardValues = () => {
  const height = parseInt(document.getElementById("heightInput").value);
  const width = parseInt(document.getElementById("widthInput").value);

  for (let row = 1; row <= height; row++) {
    for (let col = 1; col <= width; col++) {
      const img = document.getElementById(`${row}-${col}`);

      if (img.classList.contains("isBomb")) {
        boardData.push({ position: `${row}-${col}`, value: "bomb" });
      } else {
        const bombCount = img.getAttribute("data-bombs");
        boardData.push({ position: `${row}-${col}`, value: bombCount });
      }
    }
  }

  console.log(boardData);
};

const calculateBoardValues = () => {
  const height = parseInt(document.getElementById("heightInput").value);
  const width = parseInt(document.getElementById("widthInput").value);

  for (let row = 1; row <= height; row++) {
    for (let col = 1; col <= width; col++) {
      const img = document.getElementById(`${row}-${col}`);

      if (img.classList.contains("isBomb")) {
        continue;
      }

      let bombCount = 0;

      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue;

          let newRow = row + di;
          let newCol = col + dj;

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
    const firstTarget = document.getElementsByClassName("firstTarget")[0];
    id = firstTarget.getAttribute("id").split("-");
    for (let di = parseFloat(id[0]) - 1; di < parseFloat(id[0]) + 2; di++) {
      for (let dj = parseFloat(id[1]) - 1; dj < parseFloat(id[1]) + 2; dj++) {
        const element = document.getElementById(`${di}-${dj}`);
        if (element == null) {
          continue;
        } else {
          element.classList.add("aroundFirstTarget");
        }
      }
    }
    if (
      bombPosition &&
      !bombPosition.classList.contains("isBomb") &&
      !bombPosition.classList.contains("aroundFirstTarget")
    ) {
      bombPosition.classList.add("isBomb");
      minesPlaced++;
    }
  }
  bombsPlaced = true;
  calculateBoardValues();
};

const checkNearFields = (row, col) => {
  const height = parseInt(document.getElementById("heightInput").value);
  const width = parseInt(document.getElementById("widthInput").value);

  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 1; dj++) {
      if (di === 0 && dj === 0) continue;

      let newRow = +row + di;
      let newCol = +col + dj;

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
};

const clickImg = (event) => {
  if (gameIsEnd) {
    return;
  }

  if (event.button == 0) {
    if (!bombsPlaced) {
      const clickedImg = event.target;
      clickedImg.classList.add("firstTarget");
      placeMines();
      const Timer = document.createElement("div");
      Timer.id = "showTime";
      Timer.textContent = "0s";
      const bombsLeft = document.getElementById("bombCountInput").value;
      const bombCounter = document.createElement("div");
      bombCounter.id = "bombCounter";
      bombCounter.innerText = "ilość pozostałych bomb = " + bombsLeft;
      container.append(bombCounter);
      container.append(Timer);
      setInterval(() => {
        const showTime = document.querySelector("#showTime");
        if (!gameIsEnd) {
          showTime.textContent = `${
            parseInt(showTime.textContent.replace("s", "")) + 1
          }s`;
        }
      }, 1000);
    }
    const clickedImg = event.target;
    const nearBombs = clickedImg.getAttribute("data-bombs");
    const row = clickedImg.getAttribute("id").split("-")[0];
    const col = clickedImg.getAttribute("id").split("-")[1];

    console.log(row, col, clickedImg);

    if (nearBombs == null) {
      alert("przegrałeś");
      img = document.querySelectorAll("img");
      img.forEach((element) => {
        if (element.classList.contains("isBomb")) {
          element.setAttribute("src", "img/pbomb.PNG");
        }
      });
      clickedImg.setAttribute("src", "img/bomb.PNG");
      gameIsEnd = true;
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
  }
  if (event.button == 2) {
    event.preventDefault();
    const clickedImg = event.target;
    src = clickedImg.getAttribute("src");
    if (src == "img/klepa.PNG") {
      clickedImg.setAttribute("src", "img/flaga.PNG");
      clickedImg.classList.add("isFlaged");
    } else if (src == "img/flaga.PNG") {
      clickedImg.classList.remove("isFlaged");
      clickedImg.setAttribute("src", "img/pyt.PNG");
    } else if (src == "img/pyt.PNG") {
      clickedImg.setAttribute("src", "img/klepa.PNG");
    }
    const img = document.querySelectorAll("img");
    const bombCounter = document.getElementById("bombCounter");
    let bombsLeft = document.getElementById("bombCountInput").value;
    img.forEach((element) => {
      if (element.getAttribute("src") == "img/flaga.PNG") {
        bombsLeft = bombsLeft - 1;
      }
      bombCounter.innerText = "ilość pozostałych bomb = " + bombsLeft;
    });

    setTimeout(() => {
      calculateWin(bombsLeft);
    }, 1000);
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

    for (j = 1; j <= width; j++) {
      const div = document.createElement("div");
      div.classList.add("cell");
      div.id = `div-${i}-${j}`;
      div.textContent = " ";
      const img = document.createElement("img");
      img.id = `${i}-${j}`;
      img.setAttribute("src", "img/klepa.PNG");
      img.addEventListener("mousedown", clickImg);
      img.addEventListener("contextmenu", function (event) {
        event.preventDefault();
      });
      div.append(img);

      row.append(div);
    }

    board.append(row);
  }

  document.body.append(board);
  isBoardRendered = true;
};

const startGame = () => {
  const height = document.getElementById("heightInput").value;
  const width = document.getElementById("widthInput").value;
  const bombCount = document.getElementById("bombCountInput").value;

  renderBoard(height, width, bombCount);
};

const validateInput = (event) => {
  console.debug({ isNan: isNaN(event.target.value) });

  if (isNaN(event.target.value)) {
    setTimeout(() => {
      event.target.value = "";
    }, 1000);
  }
};

const renderMenu = () => {
  const heightLabel = document.createElement("label");
  heightLabel.textContent = "Wysokość:";

  const heightInput = document.createElement("input");
  heightInput.id = "heightInput";
  heightInput.addEventListener("keyup", validateInput);

  const widhtLabel = document.createElement("label");
  widhtLabel.textContent = "Szerokość:";

  const widthInput = document.createElement("input");
  widthInput.id = "widthInput";
  widthInput.addEventListener("keyup", validateInput);

  const bombCountLabel = document.createElement("label");
  bombCountLabel.textContent = "Ilość bomb:";

  const bombCountInput = document.createElement("input");
  bombCountInput.id = "bombCountInput";
  bombCountInput.addEventListener("keyup", validateInput);

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

const renderWinsTable = (selectedGameMode) => {
  const previesWins = document.cookie
    .split(";")
    .find((cookie) => cookie.includes("wins"));

  if (previesWins) {
    const unfilteredWins = JSON.parse(previesWins.split("=")[1]);
    const wins = unfilteredWins
      .filter((win) => win.gameMode == selectedGameMode)
      .sort(
        (a, b) =>
          parseInt(a.time.replace("s", "")) - parseInt(b.time.replace("s", ""))
      )
      .slice(0, 10);

    const table = document.createElement("table");
    table.id = "winsTable";
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");
    const usernameHeader = document.createElement("th");
    const timeHeader = document.createElement("th");
    const gameModeHeader = document.createElement("th");

    usernameHeader.textContent = "Username";
    timeHeader.textContent = "Time";
    gameModeHeader.textContent = "Game mode";

    headerRow.append(usernameHeader, timeHeader, gameModeHeader);
    thead.append(headerRow);

    wins.forEach((win) => {
      const row = document.createElement("tr");
      const username = document.createElement("td");
      const time = document.createElement("td");
      const gameMode = document.createElement("td");

      username.textContent = win.username;
      time.textContent = win.time;
      gameMode.textContent = win.gameMode;

      row.append(username, time, gameMode);
      tbody.append(row);
    });

    const currentTable = document.querySelector("#winsTable");
    if (currentTable) {
      currentTable.remove();
    }

    const tableDiv = document.querySelector("#tableDiv");

    table.append(thead, tbody);
    tableDiv.append(table);
  }
};

const rednerSelect = () => {
  const previesWins = document.cookie
    .split(";")
    .find((cookie) => cookie.includes("wins"));
  const wins = JSON.parse(previesWins.split("=")[1]);

  const gamesModes = wins.map((win) => win.gameMode);
  const uniqueGameModes = [];

  gamesModes.forEach((gameMode) => {
    if (!uniqueGameModes.includes(gameMode)) {
      uniqueGameModes.push(gameMode);
    }
  });

  const select = document.createElement("select");
  select.id = "gameModeSelect";

  uniqueGameModes.forEach((gameMode) => {
    const option = document.createElement("option");
    option.value = gameMode;
    option.textContent = gameMode;
    select.append(option);
  });
  const tableDiv = document.createElement("div");
  tableDiv.id = "tableDiv";

  const container = document.querySelector("#container");

  container.insertBefore(tableDiv, container.firstChild);
  container.insertBefore(select, container.firstChild);

  select.addEventListener("change", (event) =>
    renderWinsTable(event.target.value)
  );
};

const renderFirstTable = () => {
  const previesWins = document.cookie
    .split(";")
    .find((cookie) => cookie.includes("wins"));
  const unfilteredWins = JSON.parse(previesWins.split("=")[1]);
  const defaultGameMode = unfilteredWins[0].gameMode;
  renderWinsTable(defaultGameMode);
};

renderMenu();
rednerSelect();
renderFirstTable();
