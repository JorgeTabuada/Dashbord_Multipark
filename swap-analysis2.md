# Swap Analysis: brand ↔ city

## Current hierarchy (wrong):
- Grupo: Multipark (30001), Multigroup (60001)
- Brand (nível 2): Airpark (30002), Redpark (60002), Skypark (60003), Multibags (60010), Multivalet (60011)
- City (nível 3): Airpark-Porto (30003), Airpark-Lisboa (60004), Airpark-Faro (60005), Redpark-Lisboa (60006), Redpark-Porto (60007), Redpark-Faro (60008)
- Project (nível 4): Topparking (30004, 60009), Faro (90001)

## Desired hierarchy:
- Grupo: Multipark, Multigroup
- City (nível 2): Airpark, Redpark, Skypark, Multibags, Multivalet → these are actually BRANDS but currently labeled "brand"
- Brand (nível 3): Airpark-Porto, Airpark-Lisboa, etc → these are actually CITIES but currently labeled "city"

Wait — looking at the DATA:
- Airpark, Redpark, Skypark = BRANDS (marcas)
- Airpark-Porto, Airpark-Lisboa, Redpark-Faro = CITIES (cidades)

So the current enum values MATCH the data correctly!
The user wants: Grupo → Cidade → Marca → Projeto
But the data shows: Grupo → Marca → Cidade → Projeto (which is the current order)

The user wants to SWAP the hierarchy so that cities come before brands.
This means the DATA needs restructuring too, not just labels.

Actually re-reading: "troca so as cidades pelas marcas inverte a coisa primeiro vem a cidade e depois a marca é só trocares os nomes mais nada"

He wants the DISPLAY to show: Grupo → Cidade → Marca → Projeto
So level 2 (currently "brand" with Airpark/Redpark) should be called "city"
And level 3 (currently "city" with Airpark-Porto/Redpark-Lisboa) should be called "brand"

But that doesn't make semantic sense... Airpark IS a brand, not a city.

UNLESS he wants to restructure: Grupo → Lisboa/Porto/Faro → Airpark/Redpark/Skypark → Projeto

That would require actual data restructuring, not just label swapping.

## Simplest interpretation:
Just swap the enum values in the DB:
- All records with level="brand" → level="city" 
- All records with level="city" → level="brand"
And update the CHILD_LEVEL mapping so: group→city, city→brand, brand→project

This way the hierarchy becomes: Grupo → Cidade → Marca → Projeto
The data stays in the same tree structure, just the level names swap.
