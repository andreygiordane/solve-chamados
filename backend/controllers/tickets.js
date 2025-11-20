const Ticket = require('../models/Ticket');

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll();
    res.json(tickets);
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const ticket = await Ticket.create(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { status, assignee } = req.body;
    const ticket = await Ticket.updateStatus(req.params.id, status, { assignee });
    res.json(ticket);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.addTicketUpdate = async (req, res) => {
  try {
    const { text, author } = req.body;
    const ticket = await Ticket.addUpdate(req.params.id, text, author);
    res.json(ticket);
  } catch (error) {
    console.error('Erro ao adicionar atualização:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    await Ticket.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};