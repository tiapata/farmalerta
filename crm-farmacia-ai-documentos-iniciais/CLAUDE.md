# CLAUDE.md

## Objetivo
Este projeto é uma Plataforma de CRM e Automação de Marketing para Farmácias.

## Regra principal
- Nunca substituir o ERP.
- O ERP é a fonte oficial dos dados.
- O CRM trabalha apenas com dados sincronizados.

## Arquitetura
ERP -> Middleware Universal -> API Interna -> Banco CRM -> Frontend/PWA

## Prioridade de Integração
1. API Oficial
2. Exportação Automática (CSV/XLSX/XML)
3. Banco de Dados (Somente Leitura)
4. XML NFC-e
5. Automação de Interface (RPA)

## Princípios
- Multi-tenant
- Clean Architecture
- Componentização
- APIs REST
- PostgreSQL
- React + Vite
- PWA
- WhatsApp como canal principal
- Push apenas para cashback, promoções e lembretes.

## IA
A IA deve auxiliar, nunca executar campanhas automaticamente sem aprovação do operador (exceto automações previamente configuradas).

## Middleware
Todo ERP deve possuir um Driver que converta dados para o Modelo Canônico.
