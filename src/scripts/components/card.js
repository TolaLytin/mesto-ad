export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById('card-template')
    .content.querySelector('.card')
    .cloneNode(true);
};

export const createCardElement = (data, { onPreviewPicture, onLikeIcon, onDeleteCard, currentUserId }) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const cardImage = cardElement.querySelector('.card__image');

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector('.card__title').textContent = data.name;
  
  cardElement.dataset.cardId = data._id;

  if (likeCount) {
    likeCount.textContent = data.likes ? data.likes.length : 0;
  }

  if (currentUserId && data.likes) {
    const isLiked = data.likes.some(user => user._id === currentUserId);
    if (isLiked) {
      likeButton.classList.add('card__like-button_is-active');
    }
  }

  if (currentUserId && data.owner && data.owner._id !== currentUserId) {
    deleteButton.style.display = 'none';
  }

  if (onLikeIcon) {
    likeButton.addEventListener('click', () => onLikeIcon(cardElement, data._id, likeButton, likeCount));
  }

  if (onDeleteCard) {
    deleteButton.addEventListener('click', () => onDeleteCard(cardElement, data._id));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener('click', () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};