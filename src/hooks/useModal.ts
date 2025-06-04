import { useState } from "react";

type modalReturn = [boolean, () => void, () => void];

const useModal = (): modalReturn => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const openModal = () => {
    setIsOpenModal(true);
  };

  const closeModal = () => {
    setIsOpenModal(false);
  };

  return [isOpenModal, openModal, closeModal];
};

export default useModal;
