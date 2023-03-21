import { useRef, useState } from "react";
import uuid from "react-uuid";

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

  const [newCardProgressModal, setNewCardProgressModal] = useState("");
  const [newCardValue, setNewCardValue] = useState("");
  const [cardBeingEdited, setCardBeingEdited] = useState({});
  const [dragging, setDragging] = useState(false);
  const [draggingOver, setDraggingOver] = useState();
  const [cardBeingDragged, setCardBeingDragged] = useState({});
  const [cardBeingDraggedCopy, setCardBeingDraggedCopy] = useState({});

  const createCardModal = useRef(null);
  const editCardModal = useRef(null);

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
    if (cardBeingDragged.status !== dropzone) {
      setCardBeingDraggedCopy(cardBeingDragged);
      cardBeingDraggedCopy.status = dropzone;
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    console.log("asd");
    if (cardBeingDraggedCopy.status) {
      cardBeingDragged.status = cardBeingDraggedCopy.status;
    }
    setCardBeingDraggedCopy({});
    dragend();
  }

  function closeModal() {
    setNewCardProgressModal("");
    setNewCardValue("");
    setCardBeingEdited({});
    createCardModal?.current.close();
    editCardModal?.current.close();
  }

  function handleAddCard(cardProgress) {
    setNewCardProgressModal(cardProgress);
    createCardModal?.current.showModal();
  }

  function pressEnterInInput(e, newCardProgressModal, saveDirection) {
    if (e.key === "Enter") {
      handleSave(newCardProgressModal, saveDirection);
    }
    if (e.key === "Escape") {
      closeModal();
    }
  }

  function handleSave(newCardProgressModal, saveDirection) {
    if (!newCardValue) {
      alert("Please write a card");
      return;
    }
    if (saveDirection === "saveNewCard") {
      if (
        boards.find((board) =>
          board.cards.find((card) => card.content === newCardValue)
        )
      ) {
        alert("This card already exists, please create a different card");
      } else {
        const updatedBoards = structuredClone(boards);
        updatedBoards[
          updatedBoards.findIndex(
            (board) => board.name === newCardProgressModal
          )
        ].cards.push({
          id: uuid(),
          content: newCardValue,
        });
        setBoards(updatedBoards);
        closeModal();
      }
    }
    if (saveDirection === "editCard") {
      const editedBoards = structuredClone(boards);
      editedBoards[
        editedBoards.findIndex((board) => board.name === newCardProgressModal)
      ].cards.find((card) => card.id === cardBeingEdited.id).content =
        cardBeingEdited.content;
      setBoards(editedBoards);
      closeModal();
    }
  }

  function handleeditCard(card, boardName) {
    setNewCardProgressModal(boardName);
    setCardBeingEdited(card);
    editCardModal?.current.showModal();
  }

  function updatecardBeingEdited(newValue) {
    setNewCardValue(newValue);
    setCardBeingEdited({
      id: cardBeingEdited.id,
      content: newValue,
    });
  }

  function handleRemoveCard() {
    const updateBoards = structuredClone(boards);
    updateBoards[
      updateBoards.findIndex((board) => board.name === newCardProgressModal)
    ].cards = updateBoards[
      updateBoards.findIndex((board) => board.name === newCardProgressModal)
    ].cards.filter((card) => card.id !== cardBeingEdited.id);
    setBoards(updateBoards);
    closeModal();
  }

  return (
    <div className="App">
      <main className="bg-[#130F0D] text-white min-h-screen py-8">
        <div className="boards flex justify-center flex-wrap gap-5">
          {boards.map(
            (board) =>
              board && (
                <div
                  className="board h-fit bg-[#141316] border border-[#FD951F11] rounded-md"
                  key={board.id}
                >
                  <div className="flex justify-between items-center text-[#FD951FCC]">
                    <h3 className="p-4 m-0">{board.name}</h3>
                    <button
                      onClick={() => handleAddCard(board.name)}
                      title="Add a new card"
                      className={`w-8 h-8 mx-2 text-xl hover:brightness-75 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC]`}
                    >
                      +
                    </button>
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
                    onDrop={(e) => handleDrop(e)}
                    onDragLeave={() => setDraggingOver("")}
                  >
                    {board.cards.map(
                      (card) =>
                        card && (
                          <div
                            className={`card bg-[#1A1A1C] mb-7 rounded-md font-semibold text-lg w-64 p-4 shadow-custom  ${
                              cardBeingDragged === card ? "opacity-50" : ""
                            }`}
                            draggable="true"
                            onDragStart={() => dragstart(card)}
                            onDragEnd={() => dragend()}
                            key={card.id}
                          >
                            <div className="relative flex justify-between items-center">
                              <div
                                className={`w-8 h-2 mb-4 rounded-lg bg-[${board.color}]`}
                              ></div>
                              <button
                                className="absolute -right-4 -top-3 w-8 h-7 mb-4 flex justify-center items-center rotate-90 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC]"
                                onClick={() => handleeditCard(card, board.name)}
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
                                  className="hover:brightness-50"
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
              <h3 className="p-4 m-0">new {newCardProgressModal} card</h3>
              <button
                onClick={() => closeModal()}
                title="Close modal"
                className={`w-6 h-6 mx-2 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC] ${
                  newCardProgressModal === "todo"
                    ? "hover:text-red-500"
                    : newCardProgressModal === "in-progress"
                    ? "hover:text-yellow-500"
                    : "hover:text-green-500"
                }`}
              >
                x
              </button>
            </div>
            <div className="transition-colors p-4 min-w-[282px]">
              <div className="bg-[#1A1A1C] rounded-md font-semibold text-lg w-64 p-4 shadow-custom">
                <div
                  className={`w-8 h-2 mb-4 rounded-lg ${
                    newCardProgressModal === "todo"
                      ? "bg-red-500"
                      : newCardProgressModal === "in-progress"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
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
                      pressEnterInInput(e, newCardProgressModal, "saveNewCard")
                    }
                  />
                </label>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => closeModal()}
                  title="Cancel edits"
                  className="px-5 rounded-full bg-red-500 hover:brightness-75 focus-visible:outline focus-visible:outline-[#FD951FCC]"
                >
                  cancel
                </button>
                <button
                  title="Save new card"
                  onClick={() =>
                    handleSave(newCardProgressModal, "saveNewCard")
                  }
                  className="px-5 rounded-full bg-green-500 hover:brightness-75 focus-visible:outline focus-visible:outline-[#FD951FCC]"
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
              <h3 className="p-4 m-0">Edit {newCardProgressModal} card</h3>
              <div className="flex items-center">
                <button
                  title="Delete card"
                  className="w-6 h-6 focus-visible:outline focus-visible:outline-[#FD951FCC] flex justify-center items-center"
                  onClick={() => handleRemoveCard()}
                >
                  <svg
                    className="w-4 h-4 hover:fill-red-500 cursor-pointer"
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
                  className={`w-6 h-6 mx-2 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC] ${
                    newCardProgressModal === "todo"
                      ? "hover:text-red-500"
                      : newCardProgressModal === "in-progress"
                      ? "hover:text-yellow-500"
                      : "hover:text-green-500"
                  }`}
                >
                  x
                </button>
              </div>
            </div>
            <div className="transition-colors p-4 min-w-[282px]">
              <div className="bg-[#1A1A1C] rounded-md font-semibold text-lg w-64 p-4 shadow-custom">
                <div
                  className={`w-8 h-2 mb-4 rounded-lg ${
                    newCardProgressModal === "todo"
                      ? "bg-red-500"
                      : newCardProgressModal === "in-progress"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <label name="editCard" className="text-white">
                  <input
                    type="text"
                    name="editCard"
                    id="editCard"
                    autoFocus
                    className="font-[Nunito] text-white bg-[#1A1A1C] outline-none"
                    value={cardBeingEdited?.content}
                    onChange={(e) => updatecardBeingEdited(e.target.value)}
                    onKeyDown={(e) =>
                      pressEnterInInput(e, newCardProgressModal, "editCard")
                    }
                  />
                </label>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => closeModal()}
                  title="Cancel edits"
                  className="px-5 rounded-full bg-red-500 hover:brightness-75 focus-visible:outline focus-visible:outline-[#FD951FCC]"
                >
                  cancel
                </button>
                <button
                  title="Save edits"
                  onClick={() => handleSave(newCardProgressModal, "editCard")}
                  className="px-5 rounded-full bg-green-500 hover:brightness-75 focus-visible:outline focus-visible:outline-[#FD951FCC]"
                >
                  save
                </button>
              </div>
            </div>
          </div>
        </dialog>
      </main>
    </div>
  );
}
