import { enableValidation, clearValidation } from './components/validation.js';
import { initialCards } from './cards.js';
import { createCardElement, deleteCard, likeCard } from './components/card.js';
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from './components/modal.js';
import '../pages/index.css';

const validationSettings = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible',
};

enableValidation(validationSettings);

const placesList = document.querySelector('.places__list');

const profilePopup = document.querySelector('.popup_type_edit');
const profileForm = profilePopup.querySelector('.popup__form');
const profileNameInput = profileForm.querySelector('.popup__input_type_name');
const profileJobInput = profileForm.querySelector('.popup__input_type_description');
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const editButton = document.querySelector('.profile__edit-button');

const cardPopup = document.querySelector('.popup_type_new-card');
const cardForm = cardPopup.querySelector('.popup__form');
const cardNameInput = cardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = cardForm.querySelector('.popup__input_type_url');
const addButton = document.querySelector('.profile__add-button');

const imagePopup = document.querySelector('.popup_type_image');
const imageElement = imagePopup.querySelector('.popup__image');
const imageCaption = imagePopup.querySelector('.popup__caption');

const avatarPopup = document.querySelector('.popup_type_edit-avatar');
const avatarForm = avatarPopup.querySelector('.popup__form');
const avatarInput = avatarForm.querySelector('.popup__input_type_avatar');
const avatarImage = document.querySelector('.profile__image');

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imagePopup);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  profileTitle.textContent = profileNameInput.value;
  profileDescription.textContent = profileJobInput.value;
  closeModalWindow(profilePopup);
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  avatarImage.style.backgroundImage = `url(${avatarInput.value})`;
  avatarForm.reset();
  closeModalWindow(avatarPopup);
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  
  const newCard = createCardElement(
    {
      name: cardNameInput.value,
      link: cardLinkInput.value,
    },
    {
      onPreviewPicture: handlePreviewPicture,
      onLikeIcon: likeCard,
      onDeleteCard: deleteCard,
    }
  );
  
  placesList.prepend(newCard);
  cardForm.reset();
  closeModalWindow(cardPopup);
};

if (editButton && profilePopup && profileForm) {
  editButton.addEventListener('click', () => {
    profileNameInput.value = profileTitle.textContent;
    profileJobInput.value = profileDescription.textContent;
    clearValidation(profileForm, validationSettings);
    openModalWindow(profilePopup);
  });
}

if (avatarImage && avatarPopup && avatarForm) {
  avatarImage.addEventListener('click', () => {
    avatarForm.reset();
    clearValidation(avatarForm, validationSettings);
    openModalWindow(avatarPopup);
  });
}

if (addButton && cardPopup && cardForm) {
  addButton.addEventListener('click', () => {
    cardForm.reset();
    clearValidation(cardForm, validationSettings);
    openModalWindow(cardPopup);
  });
}

if (profileForm) {
  profileForm.addEventListener('submit', handleProfileFormSubmit);
}

if (avatarForm) {
  avatarForm.addEventListener('submit', handleAvatarFormSubmit);
}

if (cardForm) {
  cardForm.addEventListener('submit', handleCardFormSubmit);
}

if (placesList) {
  initialCards.forEach((card) => {
    const cardElement = createCardElement(card, {
      onPreviewPicture: handlePreviewPicture,
      onLikeIcon: likeCard,
      onDeleteCard: deleteCard,
    });
    placesList.append(cardElement);
  });
}

document.querySelectorAll('.popup').forEach((popup) => {
  if (popup) {
    setCloseModalWindowEventListeners(popup);
  }
});