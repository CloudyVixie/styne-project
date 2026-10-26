const HistoryStack = { items: [], pointer: -1, max: 50 };

function pushHistory(action){
  HistoryStack.items = HistoryStack.items.slice(0, HistoryStack.pointer + 1);
  HistoryStack.items.push(action);
  if (HistoryStack.items.length > HistoryStack.max) HistoryStack.items.shift();
  HistoryStack.pointer = HistoryStack.items.length - 1;
}

function canUndo(){ return HistoryStack.pointer >= 0; }
function canRedo(){ return HistoryStack.pointer < HistoryStack.items.length - 1; }

function undoLast(){
  if (!canUndo()) return null;
  const action = HistoryStack.items[HistoryStack.pointer];
  action.undo();
  HistoryStack.pointer--;
  return action;
}

function redoLast(){
  if (!canRedo()) return null;
  HistoryStack.pointer++;
  const action = HistoryStack.items[HistoryStack.pointer];
  action.redo();
  return action;
}
