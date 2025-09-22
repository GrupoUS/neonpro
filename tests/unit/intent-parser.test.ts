import { describe, it, expect, beforeEach } from 'vitest';
import { IntentParserService } from '../../apps/api/src/services/intent-parser';
import { QueryIntent, QueryParameters, UserRole } from '@neonpro/types';

describe('IntentParserService', () => {
  let intentParser: IntentParserService;

  beforeEach(() => {

  describe('Query Parsing - Client Data Intent', () => {
    it('should identify client data queries in Portuguese', () => {
      const queries = [
        'mostrar clientes',
        'listar todos os pacientes',
        'dados do cliente João Silva',
        'informações do paciente Maria Santos',
        'clientes cadastrados',
      ];

      queries.forEach(query => {

  describe('Query Parsing - Appointments Intent', () => {
    it('should identify appointment queries in Portuguese', () => {
      const queries = [
        'próximos agendamentos',
        'consultas de hoje',
        'agendamentos para amanhã',
        'consultas marcadas',
        'esta semana agendamentos',
      ];

      queries.forEach(query => {

  describe('Query Parsing - Financial Intent', () => {
    it('should identify financial queries in Portuguese', () => {
      const queries = [
        'como está o faturamento',
        'resumo financeiro',
        'receita gerada',
        'pagamentos recebidos',
        'balanço contábil',
      ];

      queries.forEach(query => {

  describe('Query Parsing - General Intent', () => {
    it('should identify general greeting queries', () => {
      const queries = [
        'olá',
        'bom dia',
        'boa tarde',
        'oi',
        'como você pode me ajudar',
      ];

      queries.forEach(query => {

  describe('Query Parsing - Unknown Intent', () => {
    it('should return unknown for unclear queries', () => {
      const queries = [
        'xyz',
        'asdfgh',
        'qualquer coisa',
        'não sei',
      ];

      queries.forEach(query => {

  describe('Parameter Extraction', () => {
    it('should extract client names from various formats', () => {
      const testCases = [
        { query: 'cliente João Silva', expected: ['João Silva'] },
        { query: 'paciente Maria dos Santos', expected: ['Maria dos Santos'] },
        { query: 'clientes João e Maria', expected: ['João', 'Maria'] },
        { query: 'dados do João Silva', expected: ['João Silva'] },
      ];

      testCases.forEach(({ query, expected }) => {

    it('should extract date ranges correctly', () => {
      const testCases = [
        { query: 'agendamentos de hoje', expected: 'today' },
        { query: 'consultas para amanhã', expected: 'tomorrow' },
        { query: 'esta semana', expected: 'this_week' },
        { query: 'este mês', expected: 'this_month' },
      ];

      testCases.forEach(({ query, expected }) => {

    it('should extract financial types', () => {
      const testCases = [
        { query: 'receita do mês', expected: 'revenue' },
        { query: 'pagamentos recebidos', expected: 'payments' },
        { query: 'despesas do trimestre', expected: 'expenses' },
        { query: 'faturamento anual', expected: 'revenue' },
      ];

      testCases.forEach(({ query, expected }) => {

  describe('Role-Based Processing', () => {
    it('should process queries differently based on user role', () => {
      const query = 'mostrar informações';
      

  describe('Performance Tests', () => {
    it('should parse queries quickly', () => {
      const queries = [
        'mostrar clientes',
        'agendamentos para amanhã',
        'faturamento deste mês',
        'paciente João Silva',
      ];


    it('should handle concurrent parsing', async () => {
      const queries = [
        'clientes João Silva',
        'agendamentos para amanhã',
        'faturamento deste mês',
        'dados do paciente Maria',
      ];

      const promises = queries.map(query => 
        Promise.resolve(intentParser.parseQuery(query, 'healthcare_professional'))

  describe('Portuguese Language Support', () => {
    it('should handle Portuguese special characters correctly', () => {
      const queries = [
        'agendamentos para amanhã',
        'paciente João',
        'faturamento',
        'informações do cliente',
        'consultas marcadas',
      ];

      queries.forEach(query => {

    it('should understand Brazilian Portuguese variations', () => {
      const queries = [
        'mostrar os clientes', // formal
        'mostra clientes',     // informal
        'clientes cadastro',   // incomplete
        'pacientes',           // synonym
      ];

      queries.forEach(query => {
