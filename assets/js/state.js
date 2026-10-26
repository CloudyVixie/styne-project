let S = {
  trails: [],
  active: null,
  currentUser: null,
  supportRequests: [],
  loading: false,
  offline: false,
};

function currentUser(){
  return S.currentUser;
}
function isCurrentUserAdmin(){
  return !!S.currentUser && S.currentUser.admin === true;
}

function resetLocalState(){
  S.trails = [];
  S.active = null;
  S.currentUser = null;
  S.supportRequests = [];
}

function save(){
  if (typeof syncStateToBackend === 'function') syncStateToBackend();
}
function saveAsync(){
  if (typeof syncStateNow === 'function') return syncStateNow();
  return Promise.resolve();
}

function commit() {
  renderSidebar();
  if (S.active) renderTrail(S.active);
  else showWelcome();
  if (typeof syncStateToBackend === 'function') syncStateToBackend();
}
