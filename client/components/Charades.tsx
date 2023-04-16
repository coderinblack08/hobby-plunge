import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { charadeWords } from "../lib/charades";

export function Charades({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [word, setWord] = useState<string>();

  function generateWord() {
    setWord(charadeWords[Math.floor(Math.random() * charadeWords.length)]);
  }

  useEffect(() => {
    generateWord();
  }, []);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Charades</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>The word to guess: {word}</ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={generateWord}>
            Re-Generate
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
