import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Columns = () => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [cards, setCards] = useState({
    "Column 1": [],
    "Column 2": [],
    "Column 3": []
  });

  useEffect(() => {
    const storedCards = localStorage.getItem('cards');
    if (storedCards) {
      setCards(JSON.parse(storedCards));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cards', JSON.stringify(cards));
  }, [cards]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null); 
  };

  const handleTitleChange = (event) => setTitle(event.target.value);
  const handleDescriptionChange = (event) => setDescription(event.target.value);
  const handleColumnChange = (event) => setSelectedColumn(event.target.value);

  const handleSubmit = () => {
    if (!/^[A-Za-z\s]+$/.test(title)) {
      alert('Title should only contain alphabets.');
      return;
    }

    if (description.length < 25) {
      alert('Description should be at least 25 characters long.');
      return;
    }

    if (selectedCard) {
      const updatedCards = { ...cards };
      const prevColumn = selectedCard.column;
      const updatedColumn = [...updatedCards[prevColumn]];
      const editedCardIndex = updatedColumn.findIndex(card => card.id === selectedCard.id);
      const editedCard = {
        ...selectedCard,
        title: title,
        description: description,
        column: selectedColumn 
      };
      updatedColumn.splice(editedCardIndex, 1); 
      updatedCards[prevColumn] = updatedColumn;

      updatedCards[selectedColumn] = [...updatedCards[selectedColumn], editedCard];
      setCards(updatedCards);
    } else {
      const newCard = {
        id: Date.now(), 
        title: title,
        description: description,
        column: selectedColumn 
      };
      const updatedCards = { ...cards };
      updatedCards[selectedColumn] = [...updatedCards[selectedColumn], newCard];
      setCards(updatedCards);
    }

    setTitle('');
    setDescription('');
    setSelectedColumn('');
    handleCloseModal();
  };

  const onDragEnd = (result) => {
    const { source, destination,} = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = source.droppableId;
    const destinationColumn = destination.droppableId;

    const updatedCards = { ...cards };
    const [movedCard] = updatedCards[sourceColumn].splice(source.index, 1);
    movedCard.column = destinationColumn; 
    updatedCards[destinationColumn].splice(destination.index, 0, movedCard);

    setCards(updatedCards);
  };

  const handleEditCard = (card) => {
    setTitle(card.title);
    setDescription(card.description);
    setSelectedColumn(card.column); 
    setSelectedCard(card);
    handleShowModal();
  };

  return (
    <Container fluid className="d-flex flex-column ">
      <Button variant="primary" className="mt-2 col-3" onClick={handleShowModal}>Add Card</Button>

      <Row className="" style={{ alignItems: 'flex-start' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.keys(cards).map((column, columnIndex) => (
            <Col key={columnIndex} className='m-2' style={{borderRadius:'5px', backgroundColor:'#0a58ca'}}>
              <h5 style={{color:'white'}}>{column}</h5>
              <hr/>
              <Droppable droppableId={column}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {cards[column].map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleEditCard(card)} 
                          >
                            <Card className='d-flex justify-content-center align-items-center m-2'>
                              <h5>{card.title}</h5>
                              <p>{card.description}</p>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>
          ))}
        </DragDropContext>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCard ? 'Edit Card' : 'Add Card'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="title">
              <Form.Label >Title</Form.Label>
              <Form.Control type="text" value={title} onChange={handleTitleChange} />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={handleDescriptionChange} />
            </Form.Group>
            <Form.Group controlId="column">
              <Form.Label>Select Column</Form.Label>
              <Form.Control as="select" value={selectedColumn} onChange={handleColumnChange}>
                <option value="">Select Column</option>
                {Object.keys(cards).map((column, index) => (
                  <option key={index} value={column}>{column}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Submit</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Columns;
