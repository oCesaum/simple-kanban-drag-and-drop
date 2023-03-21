import { useRef, useState } from "react";
import uuid from 'react-uuid';

import "./App.css";

export default function App() {
  const [boards, setBoards] = useState([
    {
      id: 1,
      name: "todo",
      color: "#EE4444",
      tasks: [
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
      tasks: [
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
      tasks: [
        {
          id: 3,
          content: "Fazer Comida",
        },
      ],
    },
  ]);

  const [newTaskProgressModal, setNewTaskProgressModal] = useState("");
  const [newTaskValue, setNewTaskValue] = useState("");
  const [taskBeingEdited, setTaskBeingEdited] = useState({});
  // const [taskBeingEditedIndex, setTaskBeingEditedIndex] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [draggingOver, setDraggingOver] = useState();
  const [taskBeingDragged, setTaskBeingDragged] = useState({});
  const [taskBeingDraggedCopy, setTaskBeingDraggedCopy] = useState({});

  const createTaskModal = useRef(null);
  const editTaskModal = useRef(null);

  function dragstart(task) {
    setDragging(true);
    setTaskBeingDragged(task);
  }

  function dragend() {
    setDragging(false);
    setDraggingOver("");
    setTaskBeingDragged();
  }

  function dragover(e, dropzone) {
    e.preventDefault();
    setDraggingOver(dropzone);
    if (taskBeingDragged.status !== dropzone) {
      setTaskBeingDraggedCopy(taskBeingDragged);
      taskBeingDraggedCopy.status = dropzone;
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    console.log("asd");
    if (taskBeingDraggedCopy.status) {
      taskBeingDragged.status = taskBeingDraggedCopy.status;
    }
    setTaskBeingDraggedCopy({});
    dragend();
  }

  function closeModal() {
    setNewTaskProgressModal("");
    setNewTaskValue("");
    setTaskBeingEdited({});
    createTaskModal?.current.close();
    editTaskModal?.current.close();
  }

  function handleAddTask(taskProgress) {
    setNewTaskProgressModal(taskProgress);
    createTaskModal?.current.showModal();
  }

  function pressEnterInInput(e, newTaskProgressModal, saveDirection) {
    if (e.key === "Enter") {
      handleSave(newTaskProgressModal, saveDirection);
    }
    if (e.key === "Escape") {
      closeModal();
    }
  }

  function handleSave(newTaskProgressModal, saveDirection) {
    if (!newTaskValue) {
      alert("Please write a task");
      return;
    }
    if (saveDirection === "saveNewTask") {
      if (
        boards.find((board) =>
          board.tasks.find((task) => task.content === newTaskValue)
        )
      ) {
        alert("This task already exists, please create a different task");
      } else {
        const updatedBoards = structuredClone(boards);
        updatedBoards[updatedBoards.findIndex(board => board.name === newTaskProgressModal)].tasks.push(
          {
            id: uuid(),
            content: newTaskValue,
          }
        )
        setBoards(updatedBoards);
        closeModal();
      }
    }
    if (saveDirection === "editTask") {
      const editedBoards = structuredClone(boards);
      editedBoards[editedBoards.findIndex(board => board.name === newTaskProgressModal)].tasks.find(task => task.id === taskBeingEdited.id).content = taskBeingEdited.content
      setBoards(editedBoards)
      closeModal();
    }
  }

  function handleEditTask(task, boardName) {
    setNewTaskProgressModal(boardName);
    setTaskBeingEdited(task);
    editTaskModal?.current.showModal();
  }

  function updateTaskBeingEdited(newValue) {
    setNewTaskValue(newValue)
    setTaskBeingEdited(
      {
        id: taskBeingEdited.id,
        content: newValue,
      },
    );
  }

  function handleRemoveTask() {
    const updateBoards = structuredClone(boards);
    updateBoards[updateBoards.findIndex(board => board.name === newTaskProgressModal)].tasks = updateBoards[updateBoards.findIndex(board => board.name === newTaskProgressModal)].tasks.filter(task => task.id !== taskBeingEdited.id)
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
                      onClick={() => handleAddTask(board.name)}
                      title="Add a new task"
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
                    {board.tasks.map(
                      (task) =>
                        task && (
                          <div
                            className={`card bg-[#1A1A1C] mb-7 rounded-md font-semibold text-lg w-64 p-4 shadow-custom  ${
                              taskBeingDragged === task ? "opacity-50" : ""
                            }`}
                            draggable="true"
                            onDragStart={() => dragstart(task)}
                            onDragEnd={() => dragend()}
                            key={task.id}
                          >
                            <div className="relative flex justify-between items-center">
                              <div
                                className={`w-8 h-2 mb-4 rounded-lg bg-[${board.color}]`}
                              ></div>
                              <button
                                className="absolute -right-4 -top-3 w-8 h-7 mb-4 flex justify-center items-center rotate-90 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC]"
                                onClick={() => handleEditTask(task, board.name)}
                                title="Edit this task"
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
                            <div className="content">{task.content}</div>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )
          )}
        </div>
        <dialog
          ref={createTaskModal}
          onClose={() => closeModal()}
          className="backdrop:bg-black/60 bg-transparent relative rounded-lg overflow-hidden"
        >
          <div className="board h-fit bg-[#141316] border border-[#FD951F11] rounded-md">
            <div className="flex justify-between items-center text-[#FD951FCC]">
              <h3 className="p-4 m-0">new {newTaskProgressModal} task</h3>
              <button
                onClick={() => closeModal()}
                title="Close modal"
                className={`w-6 h-6 mx-2 rounded-md focus-visible:outline focus-visible:outline-[#FD951FCC] ${
                  newTaskProgressModal === "todo"
                    ? "hover:text-red-500"
                    : newTaskProgressModal === "in-progress"
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
                    newTaskProgressModal === "todo"
                      ? "bg-red-500"
                      : newTaskProgressModal === "in-progress"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <label name="newTask" className="text-white">
                  <input
                    type="text"
                    name="newTask"
                    id="newTask"
                    autoFocus
                    placeholder="Add a new task"
                    className="font-[Nunito] text-white bg-[#1A1A1C] outline-none"
                    value={newTaskValue}
                    onChange={(e) => setNewTaskValue(e.target.value)}
                    onKeyDown={(e) =>
                      pressEnterInInput(e, newTaskProgressModal, "saveNewTask")
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
                  title="Save new task"
                  onClick={() =>
                    handleSave(newTaskProgressModal, "saveNewTask")
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
          ref={editTaskModal}
          onClose={() => closeModal()}
          className="backdrop:bg-black/60 bg-transparent relative rounded-lg overflow-hidden"
        >
          <div className="board h-fit bg-[#141316] border border-[#FD951F11] rounded-md">
            <div className="flex justify-between items-center text-[#FD951FCC]">
              <h3 className="p-4 m-0">Edit {newTaskProgressModal} task</h3>
              <div className="flex items-center">
                <button
                  title="Delete task"
                  className="w-6 h-6 focus-visible:outline focus-visible:outline-[#FD951FCC] flex justify-center items-center"
                  onClick={() => handleRemoveTask()}
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
                    newTaskProgressModal === "todo"
                      ? "hover:text-red-500"
                      : newTaskProgressModal === "in-progress"
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
                    newTaskProgressModal === "todo"
                      ? "bg-red-500"
                      : newTaskProgressModal === "in-progress"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <label name="editTask" className="text-white">
                  <input
                    type="text"
                    name="editTask"
                    id="editTask"
                    autoFocus
                    className="font-[Nunito] text-white bg-[#1A1A1C] outline-none"
                    value={taskBeingEdited?.content}
                    onChange={(e) => updateTaskBeingEdited(e.target.value)}
                    onKeyDown={(e) =>
                      pressEnterInInput(e, newTaskProgressModal, "editTask")
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
                  onClick={() => handleSave(newTaskProgressModal, "editTask")}
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
