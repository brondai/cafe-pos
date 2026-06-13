# Keroneva Cafe Physical Menu References

These photos are source references for the Cafe POS data model and seed data.

Files:

- `keroneva-food-menu.jpg`: food menu, snacks, momo, rice/noodles, pizza, pasta, sandwich, rolls, burgers, soup, sizzler.
- `keroneva-drinks-menu.jpg`: drinks menu, espresso bar, tea, iced coffee, soft drinks, lassi, shakes, matcha, beer, wine, spirits, hookah/cigarettes.

Important modeling notes from the menu:

- Prices should be treated as VAT-inclusive in the POS.
- Food and drinks should likely be grouped by category.
- Some products have variant pricing by preparation, protein, size, or measure:
  - Momo has preparation variants such as steam, kothey, fried, sadheko, chilly, soup.
  - Rice/noodles have veg/chicken/mixed/egg variants.
  - Wine has glass/bottle pricing.
  - Spirits have full/half/qtr/90ml/60ml/30ml pricing.
  - Club sandwich has veg/non-veg pricing.
  - Thenduk has veg/chicken pricing.
- Some items represent add-ons rather than normal menu items:
  - Ice-cream scoop.
  - Coffee flavor options such as vanilla, caramel, hazelnut.
- Alcohol, hookah, and cigarette items may need separate category flags later.
- Cafe operating notes visible on menu:
  - Food last order: 8:00 PM.
  - Drinks page says opens daily 07:30 AM - 09:00 PM.

Use these images when working on:

- GitHub issue #2: Design the core POS data model.
- GitHub issue #3: Add menu database models and seed data.
