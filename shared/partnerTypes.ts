// Catálogo canónico de tipos de parceiro. Partilhado entre client e server.
//
// O campo `chargeModel` define como o parceiro fatura/é faturado:
//  - commission_on_revenue: comissão = receita das reservas × commissionRate%
//  - small_commission: comissão de afiliado (rate normalmente baixa < 5%)
//  - monthly_fee: avença fixa mensal (campo `monthlyFee` na partnership)
//  - yearly_fee: avença fixa anual (campo `monthlyFee` ÷ 12 ou novo campo)
//  - prepaid_with_discount: cliente paga logo (vem na reserva com desconto já aplicado)
//  - monthly_invoice_discount: factura-se no fim do mês com desconto
//  - own_campaign: campanha própria — descontos / cashback / prémios para o centro de custos
//  - operational: parceiro operacional (ex: Top Parking nas marcas Porto)
//  - manual: sem modelo automático, lançamento manual
//
// `appliesTo` indica se o parceiro afecta receita (venda) ou custo (operacional).
// `isExtensible = true` significa que é o tipo livre "outro" para casos não previstos.

export type PartnerChargeModel =
  | "commission_on_revenue"
  | "small_commission"
  | "monthly_fee"
  | "yearly_fee"
  | "prepaid_with_discount"
  | "monthly_invoice_discount"
  | "own_campaign"
  | "operational"
  | "manual";

export type PartnerTypeAppliesTo = "sale" | "operational" | "both";

export type PartnerTypeDef = {
  id: string;
  label: string;
  description: string;
  chargeModel: PartnerChargeModel;
  appliesTo: PartnerTypeAppliesTo;
  isExtensible?: boolean;
};

export const PARTNER_TYPES: PartnerTypeDef[] = [
  {
    id: "agregador",
    label: "Agregador",
    description: "Sites de venda (ex: Looking4Parking, Parkos). Recebem comissão sobre a reserva.",
    chargeModel: "commission_on_revenue",
    appliesTo: "sale",
  },
  {
    id: "agencia_viagem",
    label: "Agência de viagem",
    description: "Agências que vendem o estacionamento como parte de um pacote.",
    chargeModel: "commission_on_revenue",
    appliesTo: "sale",
  },
  {
    id: "avenca_mensal",
    label: "Avença mensal",
    description: "Valor fixo cobrado todos os meses. Definir em `monthlyFee` da parceria.",
    chargeModel: "monthly_fee",
    appliesTo: "sale",
  },
  {
    id: "avenca_anual",
    label: "Avença anual",
    description: "Valor fixo cobrado uma vez por ano.",
    chargeModel: "yearly_fee",
    appliesTo: "sale",
  },
  {
    id: "cliente_pro",
    label: "Cliente Pro (Airpark)",
    description: "Empresas Pro — actualmente só na marca Airpark. Faturam no fim do mês com desconto.",
    chargeModel: "monthly_invoice_discount",
    appliesTo: "sale",
  },
  {
    id: "hotel",
    label: "Hotel",
    description: "Parceria com hotéis. Comissão sobre a reserva trazida.",
    chargeModel: "commission_on_revenue",
    appliesTo: "sale",
  },
  {
    id: "companhia_aerea",
    label: "Companhia aérea",
    description: "Parceria com companhias aéreas. Comissão sobre a reserva.",
    chargeModel: "commission_on_revenue",
    appliesTo: "sale",
  },
  {
    id: "afiliado",
    label: "Afiliado",
    description: "Comissão pequena. Cliente do afiliado tem desconto já reflectido na fatura.",
    chargeModel: "small_commission",
    appliesTo: "sale",
  },
  {
    id: "enterprise",
    label: "Enterprise / Corporate",
    description: "Cliente corporate. Paga logo no acto. Desconto já vem na reserva.",
    chargeModel: "prepaid_with_discount",
    appliesTo: "sale",
  },
  {
    id: "campanha_propria",
    label: "Campanha própria",
    description: "Promoções nossas com descontos, cashback ou prémios — vão para o centro de custos.",
    chargeModel: "own_campaign",
    appliesTo: "sale",
  },
  {
    id: "operacional",
    label: "Operacional",
    description: "Parceiro que gere operações (ex: Top Parking para marcas do Porto). Pagamos comissão operacional.",
    chargeModel: "operational",
    appliesTo: "operational",
  },
  {
    id: "outro",
    label: "Outro",
    description: "Casos não cobertos pelos tipos acima.",
    chargeModel: "manual",
    appliesTo: "both",
    isExtensible: true,
  },
];

export const PARTNER_TYPE_BY_ID: Record<string, PartnerTypeDef> = Object.fromEntries(
  PARTNER_TYPES.map((t) => [t.id, t]),
);

export function getPartnerType(id: string | null | undefined): PartnerTypeDef {
  if (!id) return PARTNER_TYPE_BY_ID["outro"];
  return PARTNER_TYPE_BY_ID[id] ?? PARTNER_TYPE_BY_ID["outro"];
}
