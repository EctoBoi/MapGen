const defaults = {};
defaults.rowSize = 45;
defaults.colSize = 45;
defaults.mapCenter = [
    Math.floor(defaults.colSize / 2),
    Math.floor(defaults.rowSize / 2),
];
defaults.playerPos = defaults.mapCenter;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const tileSize = 24;
canvas.width = defaults.rowSize * tileSize;
canvas.height = defaults.colSize * tileSize;

const playerChar = "P";
const blankChar = "B";
const wallChar = "W";
const floorChar = "f";
const doorChar = "d";
const pathChar = "p";

rowSize = defaults.rowSize;
colSize = defaults.colSize;

playerPos = defaults.playerPos;
let lastWalkedChar = floorChar;

let board = [];
let gameState = 1;
let gameTick = 0;
let heldDir = [false, false, false, false];

generateBoard();
drawBoard();
updateBoard();

tick();

function tick() {
    if (gameTick % 1 === 0) {
        if (heldDir[0]) handleStep(playerPos, [playerPos[0] - 1, playerPos[1]]);
        else if (heldDir[1])
            handleStep(playerPos, [playerPos[0], playerPos[1] + 1]);
        else if (heldDir[2])
            handleStep(playerPos, [playerPos[0] + 1, playerPos[1]]);
        else if (heldDir[3])
            handleStep(playerPos, [playerPos[0], playerPos[1] - 1]);
    }

    drawBoard();

    gameTick++;
    if (gameState === 1) tickTimer = setTimeout(tick, 50);
}

function updateBoard() {
    let b = board;

    b[playerPos[0]][playerPos[1]] = playerChar;

    board = b;
}

//controls
document.addEventListener("keydown", function (event) {
    if (event.key === "w") heldDir[0] = true;
    if (event.key === "d") heldDir[1] = true;
    if (event.key === "s") heldDir[2] = true;
    if (event.key === "a") heldDir[3] = true;
    if (event.key === "ArrowUp") {
        event.preventDefault();
        heldDir[0] = true;
    }
    if (event.key === "ArrowRight") {
        event.preventDefault();
        heldDir[1] = true;
    }
    if (event.key === "ArrowDown") {
        event.preventDefault();
        heldDir[2] = true;
    }
    if (event.key === "ArrowLeft") {
        event.preventDefault();
        heldDir[3] = true;
    }
});
document.addEventListener("keyup", function (event) {
    if (event.key === "w") heldDir[0] = false;
    if (event.key === "d") heldDir[1] = false;
    if (event.key === "s") heldDir[2] = false;
    if (event.key === "a") heldDir[3] = false;
    if (event.key === "ArrowUp") {
        event.preventDefault();
        heldDir[0] = false;
    }
    if (event.key === "ArrowRight") {
        event.preventDefault();
        heldDir[1] = false;
    }
    if (event.key === "ArrowDown") {
        event.preventDefault();
        heldDir[2] = false;
    }
    if (event.key === "ArrowLeft") {
        event.preventDefault();
        heldDir[3] = false;
    }
});

function handleStep(currentPos, stepPos) {
    if (board[stepPos[0]][stepPos[1]] === floorChar) {
        board[currentPos[0]][currentPos[1]] = lastWalkedChar;
        playerPos = stepPos;
        lastWalkedChar = floorChar;
        updateBoard();
    }
    if (board[stepPos[0]][stepPos[1]] === doorChar) {
        board[currentPos[0]][currentPos[1]] = lastWalkedChar;
        playerPos = stepPos;
        lastWalkedChar = doorChar;
        updateBoard();
    }
    if (board[stepPos[0]][stepPos[1]] === pathChar) {
        board[currentPos[0]][currentPos[1]] = lastWalkedChar;
        playerPos = stepPos;
        lastWalkedChar = pathChar;
        updateBoard();
    }
}

function generateBoard() {
    let b = [];

    for (let y = 0; y < colSize; y++) {
        //fill
        b[y] = [];
        for (let x = 0; x < rowSize; x++) {
            if (y === 0 || y === colSize - 1 || x === 0 || x === rowSize - 1) {
                //boarder
                b[y][x] = wallChar;
            } else {
                b[y][x] = blankChar;
            }
        }
    }

    //create rooms and paths
    const numberOfRooms = 12;
    let lastValidRoom = [
        [defaults.mapCenter[0] - 2, defaults.mapCenter[1] - 2],
        [defaults.mapCenter[0] + 2, defaults.mapCenter[1] + 2],
    ];
    let lastEntranceDir = getRandomInt(0, 3);

    if (isRoomValid(lastValidRoom, [])) {
        placeRoom(lastValidRoom);
    }

    for (let roomNum = 0; roomNum < numberOfRooms; roomNum++) {
        let attemtBuildRoom = true;
        let buildRoomAttemptCount = 0;
        while (attemtBuildRoom) {
            buildRoomAttemptCount++;

            let tempExitDir = pickExitDir(lastEntranceDir);
            let tempExitPos = pickExit(tempExitDir, lastValidRoom);
            let tempPaths = [];

            let numOfPaths = getRandomInt(4, 9); //min 3
            //create path
            for (let pathNum = 1; pathNum < numOfPaths; pathNum++) {
                if (pathNum === 1) {
                    tempPaths.push(tempExitPos); // path 0
                    b[tempExitPos[0]][tempExitPos[1]] = pathChar;

                    let leavingPathPos = [];
                    if (tempExitDir === 0)
                        leavingPathPos = [tempExitPos[0] - 1, tempExitPos[1]];
                    if (tempExitDir === 1)
                        leavingPathPos = [tempExitPos[0], tempExitPos[1] + 1];
                    if (tempExitDir === 2)
                        leavingPathPos = [tempExitPos[0] + 1, tempExitPos[1]];
                    if (tempExitDir === 3)
                        leavingPathPos = [tempExitPos[0], tempExitPos[1] - 1];

                    if (b[leavingPathPos[0]][leavingPathPos[1]] === blankChar) {
                        tempPaths.push(leavingPathPos);
                        b[leavingPathPos[0]][leavingPathPos[1]] = pathChar;
                    } else {
                        pathNum = 999;
                    }
                } else {
                    let blankCharPosNearby = removeNulls(
                        charPosNearby(b, tempPaths[pathNum - 1], blankChar)
                    );

                    if (blankCharPosNearby.length > 0) {
                        let newPath =
                            blankCharPosNearby[
                                getRandomInt(0, blankCharPosNearby.length - 1)
                            ];
                        tempPaths.push(newPath);
                        b[newPath[0]][newPath[1]] = pathChar;
                    } else {
                        pathNum = 999;
                    }
                }

                if (pathNum === 999) {
                    resetPaths(tempPaths);
                    tempPaths = [];
                }
            }

            //create room
            if (tempPaths.length > 0) {
                let newEntrancePos = tempPaths[tempPaths.length - 1];
                let newEntranceDir = getEntranceDir(tempPaths);
                //check beside end of path
                let entranceWallDirVertical = null;
                if (newEntranceDir === 0 || newEntranceDir === 2) {
                    if (
                        b[newEntrancePos[0]][newEntrancePos[1] - 1] ===
                            blankChar &&
                        b[newEntrancePos[0]][newEntrancePos[1] + 1] ===
                            blankChar
                    )
                        entranceWallDirVertical = false;
                } else {
                    if (
                        b[newEntrancePos[0] - 1][newEntrancePos[1]] ===
                            blankChar &&
                        b[newEntrancePos[0] + 1][newEntrancePos[1]] ===
                            blankChar
                    )
                        entranceWallDirVertical = true;
                }

                //null if door blocked
                if (entranceWallDirVertical !== null) {
                    let roomSizeUp = getRandomInt(2, 5);
                    let roomSizeDown = getRandomInt(2, 5);
                    let roomSizeOut = getRandomInt(3, 9);
                    let tempRoom = [
                        [newEntrancePos[0], newEntrancePos[1]],
                        [newEntrancePos[0], newEntrancePos[1]],
                    ];

                    if (entranceWallDirVertical) {
                        tempRoom[0][0] -= roomSizeUp;
                        tempRoom[1][0] += roomSizeDown;
                        if (newEntranceDir === 1) tempRoom[0][1] -= roomSizeOut;
                        else tempRoom[1][1] += roomSizeOut;
                    } else {
                        tempRoom[0][1] -= roomSizeDown;
                        tempRoom[1][1] += roomSizeUp;
                        if (newEntranceDir === 0) tempRoom[1][0] += roomSizeOut;
                        else tempRoom[0][0] -= roomSizeOut;
                    }

                    if (isRoomValid(tempRoom, newEntrancePos)) {
                        attemtBuildRoom = false;
                        placeRoom(tempRoom);
                        placePaths(tempPaths);

                        lastValidRoom = tempRoom;
                        lastEntranceDir = newEntranceDir;
                    } else {
                        resetPaths(tempPaths); //remove temp paths on fail
                    }
                } else {
                    resetPaths(tempPaths);
                }
            }

            if (buildRoomAttemptCount >= 20) attemtBuildRoom = false;
        }
    }

    //fill blanks
    for (let y = 0; y < colSize; y++) {
        for (let x = 0; x < rowSize; x++) {
            if (b[y][x] === blankChar) b[y][x] = wallChar;
        }
    }

    b[playerPos[0]][playerPos[1]] = playerChar;

    board = b;

    function isRoomValid(r, entrancePos) {
        for (let y = r[0][0]; y <= r[1][0]; y++) {
            for (let x = r[0][1]; x <= r[1][1]; x++) {
                if (
                    y < 0 ||
                    y > defaults.colSize ||
                    x < 0 ||
                    x > defaults.rowSize
                )
                    return false;
                if (y !== entrancePos[0] || x !== entrancePos[1])
                    if (b[y][x] !== blankChar) return false;
            }
        }
        return true;
    }

    function resetPaths(paths) {
        paths.forEach((arrPos, index) => {
            if (index > 0) b[arrPos[0]][arrPos[1]] = blankChar;
            else b[arrPos[0]][arrPos[1]] = wallChar;
        });
    }

    function placeRoom(r) {
        for (let y = r[0][0]; y <= r[1][0]; y++) {
            for (let x = r[0][1]; x <= r[1][1]; x++) {
                if (
                    y === r[0][0] ||
                    y === r[1][0] ||
                    x === r[0][1] ||
                    x === r[1][1]
                ) {
                    b[y][x] = wallChar;
                } else {
                    b[y][x] = floorChar;
                }
            }
        }
    }

    function placePaths(paths) {
        for (let pathNum = 0; pathNum < paths.length; pathNum++) {
            if (pathNum === 0 || pathNum === paths.length - 1)
                b[paths[pathNum][0]][paths[pathNum][1]] = doorChar;
            else b[paths[pathNum][0]][paths[pathNum][1]] = pathChar;
        }
    }

    function pickExitDir(entranceDir) {
        let dir = [0, 1, 2, 3];
        dir.splice(entranceDir, 1);
        return dir[Math.floor(Math.random() * 3)];
    }

    function pickExit(exitDir, r) {
        if (exitDir === 0)
            return [r[0][0], getRandomInt(r[0][1] + 1, r[1][1] - 1)];
        if (exitDir === 1)
            return [getRandomInt(r[0][0] + 1, r[1][0] - 1), r[1][1]];
        if (exitDir === 2)
            return [r[1][0], getRandomInt(r[0][1] + 1, r[1][1] - 1)];
        if (exitDir === 3)
            return [getRandomInt(r[0][0] + 1, r[1][0] - 1), r[0][1]];
    }

    function getEntranceDir(path) {
        let end = path[path.length - 1];
        let secondLast = path[path.length - 2];
        if (secondLast[0] < end[0]) return 0;
        if (secondLast[1] > end[1]) return 1;
        if (secondLast[0] > end[0]) return 2;
        if (secondLast[1] < end[1]) return 3;
    }
}

function charPosNearby(b, pos, char) {
    let nearbyPos = [null, null, null, null];
    if (b[pos[0] - 1][pos[1]] === char) nearbyPos[0] = [pos[0] - 1, pos[1]]; //north
    if (b[pos[0]][pos[1] + 1] === char) nearbyPos[1] = [pos[0], pos[1] + 1]; //east
    if (b[pos[0] + 1][pos[1]] === char) nearbyPos[2] = [pos[0] + 1, pos[1]]; //south
    if (b[pos[0]][pos[1] - 1] === char) nearbyPos[3] = [pos[0], pos[1] - 1]; //west
    return nearbyPos;
}

function removeNulls(arr) {
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== null) newArr.push(arr[i]);
    }
    return newArr;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawBoard() {
    boardHTML = "";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";

    let tileX = 0;
    let tileY = 0;

    for (let y = 0; y < colSize; y++) {
        for (let x = 0; x < rowSize; x++) {
            if (board[y][x] === wallChar || (x + y) % 2 === 0) {
                ctx.fillStyle = "#e7eff1";
                ctx.fillRect(tileX, tileY, tileSize, tileSize);
            }

            let txt = "";
            if (board[y][x] === wallChar) txt = "🔲";
            if (board[y][x] === playerChar) txt = "🤴";
            /* test emoji
            if (board[y][x] === pathChar) txt = "🌉";
            if (board[y][x] === floorChar) txt = "⬛";
            if (board[y][x] === doorChar) txt = "🚪";
            */

            if (txt !== "")
                ctx.fillText(
                    txt,
                    tileX + tileSize / 2 - ctx.measureText(txt).width / 2,
                    tileY + tileSize / 1.25
                );
            tileX += tileSize;
        }
        tileX = 0;
        tileY += tileSize;
    }
}
