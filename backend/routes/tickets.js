const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/tickets');

router.get('/', ticketsController.getAllTickets);
router.get('/:id', ticketsController.getTicketById);
router.post('/', ticketsController.createTicket);
router.put('/:id/status', ticketsController.updateTicketStatus);
router.post('/:id/updates', ticketsController.addTicketUpdate);
router.delete('/:id', ticketsController.deleteTicket);

module.exports = router;