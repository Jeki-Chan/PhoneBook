
const createModal         = document.getElementById('createModal');
const contactModal        = document.getElementById('contactModal');
const editModal           = document.getElementById('editModal');
const closeCreateIcon     = document.getElementById('closeCreateIcon');
const closeContactIcon    = document.getElementById('closeContactIcon');
const closeEditIcon       = document.getElementById('closeEditIcon');
const showCreateModalBtn  = document.getElementById("showCreateModalBtn");
const createContactBtn    = document.getElementById("createContactBtn");
const editContactBtn      = document.getElementById("editContactBtn");
const searchBtn           = document.getElementById("searchBtn");
const searchString        = document.getElementById("searchString");
const cleanBtn            = document.getElementById("cleanBtn");
const firstNameInput      = document.getElementById("firstNameInput");
const lastNameInput       = document.getElementById("lastNameInput");
const phoneInput          = document.getElementById("phoneInput");
const emailInput          = document.getElementById("emailInput");
const firstNameEditInput  = document.getElementById("firstNameEditInput");
const lastNameEditInput   = document.getElementById("lastNameEditInput");
const phoneEditInput      = document.getElementById("phoneEditInput");
const emailEditInput      = document.getElementById("emailEditInput");
const firstNameShow       = document.getElementById("firstNameShow");
const lastNameShow        = document.getElementById("lastNameShow");
const phoneShow           = document.getElementById("phoneShow");
const emailShow           = document.getElementById("emailShow");
const editId              = document.getElementById("editId");
const listView            = document.getElementById("list");

/* ========== Функции для работы с данными ========== */

let list = [];

const getFullName = obj => `${obj.lastName} ${obj.firstName}`.trim();

function validateContact(data) {
  for (const prop in data)
    if (data[prop]) return;
  alert('You try to create an empty contact');
  throw new Error('You try to create an empty contact');
}

function initContact(data) {
  validateContact(data);
  data.id = data.id || Date.now();
  if (!(data.firstName || data.lastName)) {
    data.lastName = data.phone ? data.phone : data.email;
  }
  return data;
}

function initList() {
  const raw = localStorage.getItem('list');
  list = raw ? JSON.parse(raw) : [];
}

function isAlreadyExist(contact) {
  const fullName = getFullName(contact);
  const isEqual = elem => getFullName(elem) === fullName && elem.id !== contact.id;
  return list.find(isEqual);
}

function confirmDupl() {
  const question = 'Такой контакт уже существует, хотите создать такой же?';
  return confirm(question);
}

function sortedInsert(elem) {
  list.push(elem);
  list.sort((a,b) => getFullName(a) > getFullName(b));
  return list.findIndex(e => e.id === elem.id);
}

function save() {
  const str = JSON.stringify(list);
  localStorage.setItem('list', str);
}

const getIndexById = id => list.findIndex(elem => elem.id === id);

function createContact(data) {
  const contact = initContact(data);
  if (isAlreadyExist(contact) && !confirmDupl()) return list;
  const pos = sortedInsert(contact);
  save();
  return { contact, pos };
}

const readContact = id => list.find(elem => elem.id === id);

function updateContact (id, data) {
  const oldPos = getIndexById(id);
  const raw = Object.assign({}, list[oldPos], data);
  const contact = initContact(raw);
  if (isAlreadyExist(contact) && !confirmDupl()) return list;
  removeContact(id);
  const newPos = sortedInsert(contact);
  save();
  return { contact, oldPos, newPos };
}

function removeContact(id) {
  const index = getIndexById(id);
  list.splice(index, 1);
  save();
  return index;
}

/* ========== Работа с модальными окнами ========== */

const showModal = modal => modal.style.display = "block";

const closeModal = modal => modal.style.display = "none";

function windowClick(event) {
  if (event.target === createModal) closeModal(createModal);
  if (event.target === contactModal) closeModal(contactModal);
}

function cleanCreateModal() {
  firstNameInput.value = "";
  lastNameInput.value = "";
  phoneInput.value = "";
  emailInput.value = "";
}

function contactModalInit(contact) {
  firstNameShow.innerHTML = contact.firstName;
  lastNameShow.innerHTML  = contact.lastName;
  phoneShow.innerHTML     = contact.phone;
  emailShow.innerHTML     = contact.email;
}

function editModalInit(contact) {
  firstNameEditInput.value  = contact.firstName;
  lastNameEditInput.value   = contact.lastName;
  phoneEditInput.value      = contact.phone;
  emailEditInput.value      = contact.email;
  editId.value              = contact.id;
}

/* ========== Нажатия на кнопку ========== */

function searchBtnClick() {
  const query = searchString.value;
  const result = searchContact(query);
  renderList(result);
}

function cleanBtnClick() {
  searchString.value = "";
  renderList(list);
}

function showButtonClick(id) {
  const contact = readContact(id);
  contactModalInit(contact);
  showModal(contactModal);
}

function showCreateModalBtnClick() {
  cleanCreateModal();
  showModal(createModal);
}

function createContactBtnClick() {
  const toCreate = {
    firstName: firstNameInput.value,
    lastName: lastNameInput.value,
    phone: phoneInput.value,
    email: emailInput.value,
  };
  const { contact, pos } = createContact(toCreate);
  insertToListView(contact, pos);
  closeModal(createModal);
}

function showEditButtonClick(id) {
  const contact = readContact(id);
  editModalInit(contact);
  showModal(editModal);
}

function searchContact(name) {
  if (!name) return list;
  return list.filter(elem => getFullName(elem)
    .toLowerCase()
    .indexOf(name.toLowerCase()) !== -1);
}

function editContactBtnClick() {
  const toUpdate = {
    firstName: firstNameEditInput.value,
    lastName: lastNameEditInput.value,
    phone: phoneEditInput.value,
    email: emailEditInput.value,
  };
  const { contact, oldPos, newPos } = updateContact(editId.value, toUpdate);
  updateListView(contact, oldPos, newPos);
  closeModal(editModal);
}

function deleteButtonClick(id) {
  const answer = confirm('Вы действительно хотите удалить этот контакт?');
  if (answer) {
    const index = removeContact(id);
    removeFromListView(index);
  }
}

/* ========== Работы со списком  в HTML ========== */

function renderButton(name, listener, contact) {
  // создаем кнопку
  const button = document.createElement("button");
  // создаем надпись
  const text = document.createTextNode(name);
  // добавляем слушателя
  button.addEventListener('click', () => listener(contact.id));
  // добавляем надпись в кнопочку
  button.appendChild(text);
  // возвращаем созданную кнопку
  return button;
}

function renderLi(contact) {
    // создаем li
    const li = document.createElement("li");
    const div = document.createElement("div");
    // создаем текст, который будет отображаться внутри li (в нашем случае полное имя контакта)
    const text = document.createTextNode(getFullName(contact));
    // создаем кнопочки Show, Edit и Delete
    const showButton = renderButton('Пр-р', showButtonClick, contact);
    const showEditButton = renderButton('Ред-е', showEditButtonClick, contact);
    const removeButton = renderButton('х', deleteButtonClick, contact);
    // добавляем текст и три кнопочки внутрь li
    div.appendChild(text);
    li.appendChild(div);
    li.appendChild(showButton);
    li.appendChild(showEditButton);
    li.appendChild(removeButton);
    // возвращаем созданную li
    return li;
}

function clearList() {
  while( listView.firstChild ){
    listView.removeChild( listView.firstChild );
  }
}

function renderList(list) {
  clearList();
  for (let i = 0; i < list.length; i++) {
    listView.appendChild(renderLi(list[i]));
  }
}

function insertToListView(contact, pos) {
  const li = renderLi(contact);
  const before = listView.children[pos];
  listView.insertBefore(li, before);
}

function updateListView(contact, oldPos, newPos) {
  removeFromListView(oldPos);
  const newElem = renderLi(contact);
  const before = listView.children[newPos];
  listView.insertBefore(newElem, before);
}

function removeFromListView(index) {
  const elem = listView.children[index];
  listView.removeChild(elem);
}

showCreateModalBtn.addEventListener('click', () => showCreateModalBtnClick());
createContactBtn.addEventListener('click', () => createContactBtnClick());
editContactBtn.addEventListener('click', () => editContactBtnClick());
searchBtn.addEventListener('click', () => searchBtnClick());
cleanBtn.addEventListener('click', () => cleanBtnClick());
closeCreateIcon.addEventListener('click', () => closeModal(createModal));
closeContactIcon.addEventListener('click', () => closeModal(contactModal));
closeEditIcon.addEventListener('click', () => closeModal(editModal));

window.onclick = windowClick;

initList();
renderList(list);
