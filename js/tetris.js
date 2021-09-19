import BLOCKS from "./blocks.js";

// dom
let playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const butt = document.querySelector(".game-text > button");
// setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// variables
let score = 0;
let duration = 500;
let downInterval;//시간 지나면 한칸씩
let tempMovingItem;


// 이동 및 블록 모양
const movingItem = {
  type: "",
  direction: 3,//0=기본 1= 왼쪽으로 2 = 아래로 3 = 오른쪽으로 돌린 모양
  top: 0,//눌렀을때 밑으로 이동
  left: 0,//누르면 옆으로 이동
};

init()
// function
// 처음 시작할때 같이 시작되는것
butt.addEventListener("click", () => {
  gameText.style.display = "none"
  const childNodes = playground.childNodes;

  childNodes.forEach(child => {
    child.remove();
    prependNewLine();
    scoreDisplay.innerText = 0;
  })
})

//필드+ 템프무빙아이탬
function init() {
  tempMovingItem = { ...movingItem };
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }
  generateNewBlock()
}

// 1. 필드 구성
function prependNewLine() {
  const li = document.createElement("li");
  const ul = document.createElement("ul");
  for (let j = 0; j < GAME_COLS; j++) {
    const metrix = document.createElement("li");
    ul.prepend(metrix);//prepend(집어넣기)
  }
  li.prepend(ul);
  playground.prepend(li);
}
// 블럭 값에 맞게 출력
function renderBlocks(moveType = "") {
  const { type, direction, top, left } = tempMovingItem;
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach(moving => {
    moving.classList.remove(type, "moving");
  })

  BLOCKS[type][direction].some(block => {
    const x = block[0] + left;
    const y = block[1] + top;
    const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null; // 삼항쓴 이유는 옆으로 벗어나면 오류나서
    const isAvailable = checkEmpty(target);
    if (isAvailable) {
      target.classList.add(type, "moving");
    } else {
      tempMovingItem = { ...movingItem };
      if (moveType === 'retry') {
        clearInterval(downInterval)
        showGameoverText();
      }
      setTimeout(() => {
        renderBlocks('retry');
        if (moveType === "top") {
          seizeBlock();
        }
      }, 0)
      return true;
    }
  })
  movingItem.direction = direction;
  movingItem.left = left;
  movingItem.top = top;
};
function seizeBlock() {//다내려가면 위치고정
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach(moving => {
    moving.classList.remove("moving");
    moving.classList.add("seized");
  })
  checkMatch();

};
function checkMatch() {
  const childNodes = playground.childNodes;
  childNodes.forEach(child => {
    let matched = true;
    child.children[0].childNodes.forEach(li => {
      if (!li.classList.contains("seized")) {
        matched = false;
      }
    })
    if (matched) {
      child.remove();
      prependNewLine();
      score++;
      scoreDisplay.innerText = score;
    }
  })
  generateNewBlock();
}
//처음 블록 랜덤으로 변경 위치 지정 다시 객체 만듬
function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, duration)

  const blockArray = Object.entries(BLOCKS);//객체의 랭스가져오기
  const randomIndex = Math.floor(Math.random() * blockArray.length);//랜덤값

  movingItem.type = blockArray[randomIndex][0];
  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
  tempMovingItem = { ...movingItem };
  renderBlocks;
};
function checkEmpty(target) {
  if (!target || target.classList.contains("seized")) {
    return false;
  }
  return true;
}

// 움직이게하기
function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType);
}
// 돌아가게하기
function chageDirection() {
  const direction = tempMovingItem.direction;
  direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
  renderBlocks();
  // tempMovingItem.direction += 1;
  // if (tempMovingItem === 4) {
  //   tempMovingItem = 0;
  // }
}
// 한번에 내리기
function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, 10)
}
// function showGameoverText
function showGameoverText() {
  gameText.style.display = "flex"
}
// event handling 키다운이 키보드 클릭 인식 콘솔로 키코드 보면됨
document.addEventListener("keydown", e => {
  switch (e.keyCode) {
    case 39:
      moveBlock("left", 1);
      break;
    case 37:
      moveBlock("left", -1);
      break;
    case 40:
      moveBlock("top", 1);
      break;
    case 38:
      chageDirection();
      break;
    case 32:
      dropBlock();
      break;
    default:
      break;
  }
})