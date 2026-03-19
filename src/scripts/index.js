import { enableValidation, clearValidation } from './components/validation.js';
import { createCardElement, deleteCard } from './components/card.js';
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from './components/modal.js';
import {
  getUserInfo,
  getCards,
  updateUserInfo,
  updateAvatar,
  addCard,
  deleteCardRequest,
  changeLikeStatus
} from './components/api.js';
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
const loadingIndicator = document.querySelector('.loading-indicator');

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

const logoElement = document.querySelector('.header__logo');
const statsPopup = document.querySelector('.popup_type_info');
const statsLists = statsPopup?.querySelectorAll('.popup__info-list');
const generalList = statsLists?.[0];
const datesList = statsLists?.[1];
const userContainer = statsPopup?.querySelector('.popup__info-user');

let myId = null;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoItem = (term, definition) => {
  const template = document.getElementById('popup-info-definition-template').content;
  const item = template.querySelector('.popup__info-item').cloneNode(true);
  item.querySelector('.popup__info-term').textContent = term;
  item.querySelector('.popup__info-definition').textContent = definition;
  return item;
};

const createUserPreview = (user, count) => {
  const template = document.getElementById('popup-info-user-preview-template').content;
  const preview = template.querySelector('.popup__info-user-preview').cloneNode(true);
  preview.querySelector('.popup__info-user-avatar').style.backgroundImage = `url(${user.avatar})`;
  preview.querySelector('.popup__info-user-name').textContent = user.name;
  preview.querySelector('.popup__info-user-about').textContent = user.about;
  preview.querySelector('.popup__info-user-cards-count').textContent = count;
  return preview;
};

const getStats = (cards) => {
  const counts = {};
  cards.forEach(card => {
    const ownerId = card.owner._id;
    counts[ownerId] = (counts[ownerId] || 0) + 1;
  });
  
  let topUser = null;
  let maxCount = 0;
  
  if (cards.length) {
    Object.entries(counts).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        const cardWithUser = cards.find(card => card.owner._id === id);
        if (cardWithUser) {
          topUser = {
            ...cardWithUser.owner,
            count: count
          };
        }
      }
    });
  }
  
  return {
    total: cards.length,
    unique: Object.keys(counts).length,
    topUser,
  };
};

const handleLogoClick = () => {
  getCards()
    .then((cards) => {
      generalList.innerHTML = '';
      datesList.innerHTML = '';
      userContainer.innerHTML = '';
      
      const stats = getStats(cards);
      
      generalList.append(
        createInfoItem("Всего карточек:", stats.total.toString()),
        createInfoItem("Уникальных пользователей:", stats.unique.toString())
      );
      
      if (cards.length) {
        const firstDate = formatDate(new Date(cards[cards.length - 1].createdAt));
        const lastDate = formatDate(new Date(cards[0].createdAt));
        datesList.append(
          createInfoItem("Первая создана:", firstDate),
          createInfoItem("Последняя создана:", lastDate)
        );
      }
      
      if (stats.topUser) {
        userContainer.append(createUserPreview(stats.topUser, stats.topUser.count));
      }
      
      openModalWindow(statsPopup);
    })
    .catch((err) => console.log(err));
};

const renderCard = (card, container) => {
  const cardElement = createCardElement(
    {
      name: card.name,
      link: card.link,
      _id: card._id,
      owner: card.owner,
      likes: card.likes
    },
    {
      onPreviewPicture: handlePreviewPicture,
      onLikeIcon: handleLikeClick,
      onDeleteCard: handleDeleteClick,
      currentUserId: myId
    }
  );
  container.append(cardElement);
};

const handleLikeClick = (cardElement, cardId, likeButton, likeCount) => {
  const isActive = likeButton.classList.contains('card__like-button_is-active');
  const currentCount = parseInt(likeCount.textContent) || 0;
  
  likeButton.classList.toggle('card__like-button_is-active');
  likeCount.textContent = isActive ? currentCount - 1 : currentCount + 1;
  likeButton.disabled = true;
  
  changeLikeStatus(cardId, isActive)
    .then((updatedCard) => {
      likeCount.textContent = updatedCard.likes.length;
    })
    .catch((err) => {
      console.log(err);
      likeButton.classList.toggle('card__like-button_is-active');
      likeCount.textContent = currentCount;
    })
    .finally(() => {
      likeButton.disabled = false;
    });
};

const handleDeleteClick = (cardElement, cardId) => {
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const originalText = deleteButton.textContent;
  
  deleteButton.textContent = 'Удаление...';
  deleteButton.disabled = true;
  
  deleteCardRequest(cardId)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch((err) => {
      console.log(err);
      deleteButton.textContent = originalText;
      deleteButton.disabled = false;
    });
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imagePopup);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = profileForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;
  
  updateUserInfo({
    name: profileNameInput.value,
    about: profileJobInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profilePopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = avatarForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;
  
  updateAvatar(avatarInput.value)
    .then((userData) => {
      avatarImage.style.backgroundImage = `url(${userData.avatar})`;
      avatarForm.reset();
      clearValidation(avatarForm, validationSettings);
      closeModalWindow(avatarPopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = cardForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Создание...';
  submitButton.disabled = true;
  
  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCardData) => {
      renderCard(newCardData, placesList);
      cardForm.reset();
      clearValidation(cardForm, validationSettings);
      closeModalWindow(cardPopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

if (loadingIndicator) {
  loadingIndicator.style.display = 'flex';
}

Promise.all([getCards(), getUserInfo()])
  .then(([cards, userData]) => {
    myId = userData._id;
    
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    avatarImage.style.backgroundImage = `url(${userData.avatar})`;
    
    cards.forEach((card) => {
      renderCard(card, placesList);
    });
    
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
  })
  .catch((err) => {
    console.log(err);
  });

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

if (logoElement && statsPopup) {
  logoElement.addEventListener('click', handleLogoClick);
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

document.querySelectorAll('.popup').forEach((popup) => {
  if (popup) {
    setCloseModalWindowEventListeners(popup);
  }
});