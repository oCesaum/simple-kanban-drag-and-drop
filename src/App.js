import { useRef, useState } from "react";
import uuid from "react-uuid";
import { ChromePicker } from "react-color";

import "./App.css";

export default function App() {
  const [boards, setBoards] = useState([
    {
      id: 1,
      name: "todo",
      color: "#EE4444",
      cards: [
        {
          id: 1,
          content: "Fazer Vídeos",
        },
      ],
    },
    {
      id: 2,
      name: "in-progress",
      color: "#EAB308",
      cards: [
        {
          id: 2,
          content: "Fazer Códigos",
        },
      ],
    },
    {
      id: 3,
      name: "done",
      color: "#22C55E",
      cards: [
        {
          id: 3,
          content: "Fazer Comida",
        },
      ],
    },
  ]);

  const [newBoardValue, setNewBoardValue] = useState();
  const [newCardValue, setNewCardValue] = useState("");
  const [cardBeingEdited, setCardBeingEdited] = useState({});
  const [boardBeingEdited, setBoardBeingEdited] = useState({});
  const [dragging, setDragging] = useState(false);
  const [draggingOver, setDraggingOver] = useState();
  const [cardBeingDragged, setCardBeingDragged] = useState({});

  const createCardModal = useRef(null);
  const editCardModal = useRef(null);
  const editBoardModal = useRef(null);

  const [currentColor, setCurrentColor] = useState("#fff");

  function dragstart(card) {
    setDragging(true);
    setCardBeingDragged(card);
  }

  function dragend() {
    setDragging(false);
    setDraggingOver("");
    setCardBeingDragged();
  }

  function dragover(e, dropzone) {
    e.preventDefault();
    setDraggingOver(dropzone);
  }

  function handleDrop(e, dropzone) {
    e.preventDefault();
  
    const sourceBoardIndex = boards.findIndex((board) =>
      board.cards.includes(cardBeingDragged)
    );
    const sourceBoard = boards[sourceBoardIndex];
    const targetBoardIndex = boards.findIndex((board) => board.name === dropzone);
    const targetBoard = boards[targetBoardIndex];
  
    // Removendo o cartão do quadro de origem
    sourceBoard.cards = sourceBoard.cards.filter(
      (card) => card !== cardBeingDragged
    );
  
    // Obter o elemento sob o mouse
    const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
  
    // Verificar se o elemento é um cartão
    const isCardElement =
      elementUnderMouse &&
      elementUnderMouse.classList.contains("card");
  
    let dropIndex = targetBoard.cards.length;
  
    if (isCardElement) {
      // Encontrar o índice do cartão sob o mouse
      const cardElementUnderMouse = elementUnderMouse;
      const cardIdUnderMouse = parseInt(cardElementUnderMouse.dataset.cardId);
      const cardIndexUnderMouse = targetBoard.cards.findIndex(
        (card) => card.id === cardIdUnderMouse
      );
  
      // Determinar se o cartão deve ser inserido antes ou depois do cartão sob o mouse
      const cardRect = cardElementUnderMouse.getBoundingClientRect();
      const mouseYRelativeToCard = e.clientY - cardRect.top;
  
      if (mouseYRelativeToCard < cardRect.height / 2) {
        dropIndex = cardIndexUnderMouse;
      } else {
        dropIndex = cardIndexUnderMouse + 1;
      }
    }
  
    // Inserir o cartão na posição correta no quadro de destino
    targetBoard.cards.splice(dropIndex, 0, cardBeingDragged);
  
    // Atualizando o estado dos quadros
    const updatedBoards = [...boards];
    updatedBoards[sourceBoardIndex] = sourceBoard;
    updatedBoards[targetBoardIndex] = targetBoard;
    setBoards(updatedBoards);
  
    // Limpando o estado de arrastar e soltar
    setCardBeingDragged(null);
    setDraggingOver(null);
    dragend();
  }  

  function getMousePositionInElement(e, element) {
    const elementRect = element.getBoundingClientRect();
    const x = e.clientX - elementRect.left;
    const y = e.clientY - elementRect.top;
    return { x, y };
  }  

  function closeModal() {
    setNewBoardValue("");
    setNewCardValue("");
    setCardBeingEdited({});
    createCardModal?.current.close();
    editCardModal?.current.close();
    editBoardModal?.current.close();
  }

  function handleAddCard(cardProgress) {
    setNewBoardValue(cardProgress);
    createCardModal?.current.showModal();
  }

  function pressEnterInInput(e, newBoardValue, saveDirection) {
    if (e.key === "Enter") {
      handleSave(newBoardValue, saveDirection);
    }
    if (e.key === "Escape") {
      closeModal();
    }
  }

  function handleSave(newBoardValue, saveDirection) {
    if (!newBoardValue && boardBeingEdited.color === currentColor) {
      alert("Please write a text");
      return;
    }
    const updatedBoards = structuredClone(boards);
    const targetBoardIndex = updatedBoards.findIndex(
      (board) => board.name === newBoardValue
    );

    if (saveDirection === "saveNewCard") {
      if (
        boards.find((board) =>
          board.cards.find((card) => card.content === newCardValue)
        )
      ) {
        alert("This card already exists, please create a different card");
      } else {
        updatedBoards[targetBoardIndex].cards.push({
          id: uuid(),
          content: newCardValue,
        });
        setBoards(updatedBoards);
      }
    }
    if (saveDirection === "editCard") {
      updatedBoards[targetBoardIndex].cards.find(
        (card) => card.id === cardBeingEdited.id
      ).content = cardBeingEdited.content;
      setBoards(updatedBoards);
    }
    if (saveDirection === "newBoardValue") {
      const boardBeingEditedIndex = boards.findIndex(
        (board) => board.id === boardBeingEdited.id
      );
      if (boardBeingEdited.color !== currentColor) {
        boardBeingEdited.color = currentColor;
      }
      updatedBoards[boardBeingEditedIndex] = boardBeingEdited;
      setBoards(updatedBoards);
    }
    closeModal();
  }

  function handleEditCard(card, newBoardValue) {
    setNewBoardValue(newBoardValue);
    setCardBeingEdited(card);
    editCardModal?.current.showModal();
  }

  function handleEditBoard(board) {
    setBoardBeingEdited(board);
    setCurrentColor(board.color);
    editBoardModal?.current.showModal();
  }

  function handkeUpdateCardBeingEdited(newValue) {
    setNewCardValue(newValue);
    setCardBeingEdited({
      id: cardBeingEdited.id,
      content: newValue,
    });
  }

  function handleUpdateBoardBeingEdited(newValue) {
    setNewBoardValue(newValue);
    setBoardBeingEdited({
      id: boardBeingEdited.id,
      name: newValue,
      color: boardBeingEdited.color,
      cards: boardBeingEdited.cards,
    });
  }

  function handleRemoveCard() {
    const confirmation = window.confirm(
      "Are you sure you want to delete this card?"
    );
    const updateBoards = structuredClone(boards);
    if (confirmation) {
      updateBoards[
        updateBoards.findIndex((board) => board.name === newBoardValue)
      ].cards = updateBoards[
        updateBoards.findIndex((board) => board.name === newBoardValue)
      ].cards.filter((card) => card.id !== cardBeingEdited.id);
      setBoards(updateBoards);
      closeModal();
    }
  }

  function handleRemoveBoard() {
    const confirmation = window.confirm(
      "Are you sure you want to delete this board?"
    );
    if (confirmation) {
      const boardsCopy = structuredClone(boards);
      setBoards(boardsCopy.filter((board) => board.id !== boardBeingEdited.id));
      closeModal();
    }
  }
  return (
    <div className="App min-h-screen bg-[#130F0D] flex flex-col">
      <header className="flex justify-between items-center text-white py-5 px-10 font-bold uppercase border-b border-[#FD951F11]">
        <h1 className="text-2xl hover:text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600 transition-colors duration-200">
          Simple Kamban <span className="text-sm">Drag and Drop</span>
        </h1>
      </header>
      <main className="text-white py-8 px-10 flex-grow">
        <div className="boards flex flex-wrap gap-5">
          {boards.map(
            (board) =>
              board && (
                <div
                  className="board h-fit max-w-[288px] bg-[#141316] border border-[#FD951F11] rounded-md"
                  key={board.id}
                >
                  <div className="flex justify-between items-center text-[#FD951FCC]">
                    <h2 className="p-4 m-0">{board.name}</h2>
                    <div className="flex mr-2">
                      <button
                        onClick={() => handleAddCard(board.name)}
                        title="Add a new card"
                        className={`w-6 h-8 text-xl hover:brightness-75 transition-all duration-200 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC]`}
                      >
                        +
                      </button>
                      <button
                        className="w-6 h-8 flex justify-center items-center rotate-90 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC]"
                        onClick={() => handleEditBoard(board)}
                        title="Edit this board"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#FD951FCC"
                          version="1.1"
                          id="Capa_1"
                          width="18px"
                          height="18px"
                          viewBox="0 0 41.915 41.916"
                          className="hover:brightness-50 transition-all duration-200"
                        >
                          <g>
                            <g>
                              <path d="M11.214,20.956c0,3.091-2.509,5.589-5.607,5.589C2.51,26.544,0,24.046,0,20.956c0-3.082,2.511-5.585,5.607-5.585    C8.705,15.371,11.214,17.874,11.214,20.956z" />
                              <path d="M26.564,20.956c0,3.091-2.509,5.589-5.606,5.589c-3.097,0-5.607-2.498-5.607-5.589c0-3.082,2.511-5.585,5.607-5.585    C24.056,15.371,26.564,17.874,26.564,20.956z" />
                              <path d="M41.915,20.956c0,3.091-2.509,5.589-5.607,5.589c-3.097,0-5.606-2.498-5.606-5.589c0-3.082,2.511-5.585,5.606-5.585    C39.406,15.371,41.915,17.874,41.915,20.956z" />
                            </g>
                          </g>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div
                    className={`dropzone transition-colors p-4 min-w-[282px] min-h-[144px] ${
                      draggingOver === board.name
                        ? "bg-[#4CD13711]"
                        : dragging
                        ? "bg-[#FD951F08]"
                        : ""
                    }`}
                    onDragOver={(e) => dragover(e, board.name)}
                    onDrop={(e) => handleDrop(e, board.name)}
                    onDragLeave={() => setDraggingOver("")}
                  >
                    {board.cards.map(
                      (card) =>
                        card && (
                          <div
                            className={`card bg-[#1A1A1C] mb-7 rounded-md font-semibold text-lg w-64 p-4 shadow-custom  ${
                              cardBeingDragged === card ? "opacity-50" : ""
                            }`}
                            data-card-id={card.id}
                            draggable="true"
                            onDragStart={() => dragstart(card)}
                            onDragEnd={() => dragend()}
                            key={card.id}
                          >
                            <div className="relative flex justify-between items-center">
                              <div
                                style={{ backgroundColor: board.color }}
                                className={`w-8 h-2 mb-4 rounded-lg`}
                              ></div>
                              <button
                                className="absolute -right-4 -top-3 w-8 h-8 mb-4 flex justify-center items-center rotate-90 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC]"
                                onClick={() => handleEditCard(card, board.name)}
                                title="Edit this card"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="white"
                                  version="1.1"
                                  id="Capa_1"
                                  width="18px"
                                  height="18px"
                                  viewBox="0 0 41.915 41.916"
                                  className="hover:brightness-50 transition-all duration-200"
                                >
                                  <g>
                                    <g>
                                      <path d="M11.214,20.956c0,3.091-2.509,5.589-5.607,5.589C2.51,26.544,0,24.046,0,20.956c0-3.082,2.511-5.585,5.607-5.585    C8.705,15.371,11.214,17.874,11.214,20.956z" />
                                      <path d="M26.564,20.956c0,3.091-2.509,5.589-5.606,5.589c-3.097,0-5.607-2.498-5.607-5.589c0-3.082,2.511-5.585,5.607-5.585    C24.056,15.371,26.564,17.874,26.564,20.956z" />
                                      <path d="M41.915,20.956c0,3.091-2.509,5.589-5.607,5.589c-3.097,0-5.606-2.498-5.606-5.589c0-3.082,2.511-5.585,5.606-5.585    C39.406,15.371,41.915,17.874,41.915,20.956z" />
                                    </g>
                                  </g>
                                </svg>
                              </button>
                            </div>
                            <div className="content">{card.content}</div>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )
          )}
        </div>
        <dialog
          ref={createCardModal}
          onClose={() => closeModal()}
          className="backdrop:bg-black/60 bg-transparent relative rounded-lg overflow-hidden"
        >
          <div className="board h-fit bg-[#141316] border border-[#FD951F11] rounded-md">
            <div className="flex justify-between items-center text-[#FD951FCC]">
              <h2 className="p-4 m-0">new {newBoardValue} card</h2>
              <button
                onClick={() => closeModal()}
                title="Close modal"
                className="w-6 h-6 mx-2 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC] hover:text-red-500 transition-colors duration-200"
              >
                x
              </button>
            </div>
            <div className="transition-colors p-4 min-w-[282px]">
              <div className="bg-[#1A1A1C] rounded-md font-semibold text-lg w-64 p-4 shadow-custom">
                <div
                  style={{
                    backgroundColor: boards.find((board) =>
                      board.cards.find((card) => card.id === cardBeingEdited.id)
                    )?.color,
                  }}
                  className="w-8 h-2 mb-4 rounded-lg"
                ></div>
                <label name="newCard" className="text-white">
                  <input
                    type="text"
                    name="newCard"
                    id="newCard"
                    autoFocus
                    placeholder="Add a new card"
                    className="font-[Nunito] text-white bg-[#1A1A1C] outline-none"
                    value={newCardValue}
                    onChange={(e) => setNewCardValue(e.target.value)}
                    onKeyDown={(e) =>
                      pressEnterInInput(e, newBoardValue, "saveNewCard")
                    }
                  />
                </label>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => closeModal()}
                  title="Cancel edits"
                  className="px-5 rounded-full bg-red-500 hover:brightness-75 transition-all duration-200 focus-visible:outline focus-visible:outline-[#FD951FCC]"
                >
                  cancel
                </button>
                <button
                  title="Save new card"
                  onClick={() => handleSave(newBoardValue, "saveNewCard")}
                  className="px-5 rounded-full bg-green-500 hover:brightness-75 transition-all duration-200 focus-visible:outline focus-visible:outline-[#FD951FCC]"
                >
                  save
                </button>
              </div>
            </div>
          </div>
        </dialog>
        <dialog
          ref={editCardModal}
          onClose={() => closeModal()}
          className="backdrop:bg-black/60 bg-transparent relative rounded-lg overflow-hidden"
        >
          <div className="board h-fit bg-[#141316] border border-[#FD951F11] rounded-md">
            <div className="flex justify-between items-center text-[#FD951FCC]">
              <h2 className="p-4 m-0">Edit {newBoardValue} card</h2>
              <div className="flex items-center">
                <button
                  title="Delete card"
                  className="w-6 h-6 focus-visible:outline focus-visible:outline-[#FD951FCC] flex justify-center items-center"
                  onClick={() => handleRemoveCard()}
                >
                  <svg
                    className="w-4 h-4 hover:fill-red-500 transition-colors duration-200 cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    fill="#FD951FCC"
                  >
                    <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                  </svg>
                </button>
                <button
                  onClick={() => closeModal()}
                  title="Close modal"
                  className="w-6 h-6 mx-2 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC] hover:text-red-500 transition-colors duration-200"
                >
                  x
                </button>
              </div>
            </div>
            <div className="transition-colors p-4 min-w-[282px]">
              <div className="bg-[#1A1A1C] rounded-md font-semibold text-lg w-64 p-4 shadow-custom">
                <div
                  style={{
                    backgroundColor: boards.find((board) =>
                      board.cards.find((card) => card.id === cardBeingEdited.id)
                    )?.color,
                  }}
                  className="w-8 h-2 mb-4 rounded-lg"
                ></div>
                <label name="editCard" className="text-white">
                  <input
                    type="text"
                    name="editCard"
                    id="editCard"
                    autoFocus
                    className="font-[Nunito] text-white bg-[#1A1A1C] outline-none"
                    value={cardBeingEdited?.content}
                    onChange={(e) =>
                      handkeUpdateCardBeingEdited(e.target.value)
                    }
                    onKeyDown={(e) =>
                      pressEnterInInput(e, newBoardValue, "editCard")
                    }
                  />
                </label>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => closeModal()}
                  title="Cancel edits"
                  className="px-5 rounded-full bg-red-500 hover:brightness-75 transition-all duration-200 focus-visible:outline focus-visible:outline-[#FD951FCC]"
                >
                  cancel
                </button>
                <button
                  title="Save edits"
                  onClick={() => handleSave(newBoardValue, "editCard")}
                  className="px-5 rounded-full bg-green-500 hover:brightness-75 transition-all duration-200 focus-visible:outline focus-visible:outline-[#FD951FCC]"
                >
                  save
                </button>
              </div>
            </div>
          </div>
        </dialog>
        <dialog
          ref={editBoardModal}
          onClose={() => closeModal()}
          className="backdrop:bg-black/60 bg-transparent relative rounded-lg overflow-hidden"
        >
          <div className="flex gap-5">
            <div className="board h-fit bg-[#141316] border border-[#FD951F11] rounded-md">
              <div className="flex justify-between items-center text-[#FD951FCC]">
                <h2 className="p-4 m-0">
                  Edit{" "}
                  {
                    boards.find((board) => board.id === boardBeingEdited.id)
                      ?.name
                  }{" "}
                  board
                </h2>
                <div className="flex items-center">
                  <button
                    title="Delete board"
                    className="w-6 h-6 focus-visible:outline focus-visible:outline-[#FD951FCC] flex justify-center items-center"
                    onClick={() => handleRemoveBoard()}
                  >
                    <svg
                      className="w-4 h-4 hover:fill-red-500 transition-colors duration-200 cursor-pointer"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      fill="#FD951FCC"
                    >
                      <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => closeModal()}
                    title="Close modal"
                    className="w-6 h-6 mx-2 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC] hover:text-red-500 transition-colors duration-200"
                  >
                    x
                  </button>
                </div>
              </div>
              <div className="transition-colors p-4 min-w-[282px]">
                <div className="bg-[#1A1A1C] rounded-md font-semibold text-lg w-64 p-4 shadow-custom">
                  <div
                    style={{
                      backgroundColor: currentColor,
                    }}
                    className="w-8 h-2 mb-4 rounded-lg"
                  ></div>
                  <label name="editBoardName" className="text-white">
                    <input
                      type="text"
                      name="editBoardName"
                      id="editBoardName"
                      autoFocus
                      className="font-[Nunito] text-white bg-[#1A1A1C] outline-none"
                      value={boardBeingEdited?.name}
                      onChange={(e) =>
                        handleUpdateBoardBeingEdited(
                          e.target.value,
                          "newBoardValue"
                        )
                      }
                      onKeyDown={(e) =>
                        pressEnterInInput(e, newBoardValue, "editBoardName")
                      }
                    />
                  </label>
                </div>
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => closeModal()}
                    title="Cancel edits"
                    className="px-5 rounded-full bg-red-500 hover:brightness-75 transition-all duration-200 focus-visible:outline focus-visible:outline-[#FD951FCC]"
                  >
                    cancel
                  </button>
                  <button
                    title="Save edits"
                    onClick={() => handleSave(newBoardValue, "newBoardValue")}
                    className="px-5 rounded-full bg-green-500 hover:brightness-75 transition-all duration-200 focus-visible:outline focus-visible:outline-[#FD951FCC]"
                  >
                    save
                  </button>
                </div>
              </div>
            </div>
            <ChromePicker
              color={currentColor}
              disableAlpha
              onChange={(color) => setCurrentColor(color.hex)}
              className="color-picker bg-[#141316] rounded-md"
            />
          </div>
        </dialog>
      </main>
      <footer className="text-white py-3 sm:py-5 px-0 sm:px-10 font-bold uppercase border-t border-[#FD951F11] flex justify-center md:justify-between items-center flex-wrap">
        <div className="text-[10px] mx-auto lg:mx-0">
          <a
            href="https://codepen.io/maykbrito/details/ZEbNxrZ"
            className="hover:text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600 transition-colors duration-200 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC]"
            target={"_blank"}
            rel="noreferrer"
            title="Click to go to GitHub project"
          >
            &copy; Copyright 2023 by mayk brito{" "}
          </a>
          |{" "}
          <a
            href="https://github.com/oCesaum/simple-kanban-drag-and-drop"
            target={"_blank"}
            rel="noreferrer"
            className="hover:text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600 transition-colors duration-200 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC]"
            title="project repository"
          >
            modifications by César Augusto
          </a>
        </div>
        <ul className="w-fit flex gap-4 text-sm mx-auto lg:mx-0">
          <li>
            <a
              href="https://github.com/oCesaum"
              target={"_blank"}
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600 transition-colors duration-200 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC] group"
            >
              <svg
                className="w-7 h-7 fill-white group-hover:fill-[url(#gradiente)]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 496 512"
              >
                <linearGradient
                  id="gradiente"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#E4E4E7" />
                  <stop offset="100%" stopColor="#71717A" />
                </linearGradient>
                <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
              </svg>
              GitHub
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/cesar-augsuto/"
              target={"_blank"}
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600 transition-colors duration-200 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC] group"
            >
              <svg
                className="w-7 h-7 fill-white group-hover:fill-[url(#gradiente)]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <linearGradient
                  id="gradiente"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#E4E4E7" />
                  <stop offset="100%" stopColor="#71717A" />
                </linearGradient>
                <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
              </svg>
              Linkedin
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
}
