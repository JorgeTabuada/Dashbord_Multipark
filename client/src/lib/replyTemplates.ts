// Modelos de resposta ao cliente — partilhados por Reclamações e Perdidos&Achados
// (que devem comportar-se de forma semelhante). O corpo é o CONTEÚDO; a saudação
// ("Olá {nome},") é adicionada no envio, por isso aqui não se repete.

export type ReplyTemplate = { key: string; label: string; body: string };

export const REPLY_TEMPLATES: ReplyTemplate[] = [
  { key: "investigar", label: "Estamos a investigar",
    body: "Estamos a investigar a situação reportada e damos-lhe notícias assim que possível." },
  { key: "conclusao", label: "Conclusão em breve",
    body: "Chegaremos em breve a uma conclusão sobre o seu caso e entraremos em contacto." },
  { key: "devolver", label: "Tem razão — vamos devolver",
    body: "Tem toda a razão. Vamos proceder à devolução." },
  { key: "solucao", label: "Encontrámos a solução",
    body: "Encontrámos a solução para a sua situação e estamos a tratar dela." },
  { key: "arranjar_risco", label: "Arranjámos o risco",
    body: "Arranjámos o risco no veículo, que fica como novo." },
  { key: "risco_previo", label: "Risco já existia (gravações)",
    body: "Após análise das nossas gravações, verificámos que, infelizmente, o risco já se encontrava presente antes da entrega do veículo." },
  { key: "encontrado", label: "Objeto/valor encontrado",
    body: "Informamos que encontrámos o objeto/valor associado à sua reserva. Pode levantá-lo no parque ou responder a este email para combinarmos a devolução." },
];
