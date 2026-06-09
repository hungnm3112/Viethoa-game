# Full Translation Plan

Muc tieu:

- viet hoa toan bo text co gia tri choi game
- co resume neu bi ngat giua chung
- co fallback model
- co rollback output neu ghi file loi
- co dashboard de theo doi % hoan thanh

## Phase 0 - Nen tang

- build lai queue tu `input/`
- bo qua nhung chuoi da duoc dich trong `output/`
- tai su dung chuoi da co trong `cache/translations.json`
- sinh dashboard va event log

## Phase 1 - UI / tips / radio / todo

- `embeddedstrings.xml`
- `hints.xml`
- `radiooptions.xml`
- `todolist.xml`

Muc tieu:

- vao game khong bi mu UI
- loading tips, thong bao, popup, radio command de hieu

## Phase 2 - Mission / story / objective

- `missions.xml`
- `scenes.xml`

Muc tieu:

- hieu intro, objective, dialogue, story slice

## Phase 3 - Item / survivor / facility / RTS

- `items.xml`
- `characters.xml`
- `facilities.xml`
- `expertise.xml`
- `rtsevents.xml`
- `search.xml`
- `enclaves.xml`
- `fatecards.xml`

Muc tieu:

- inventory, trait, ky nang, base management, event world de choi duoc tron ven

## Phase 4 - Con lai

- cac XML khac con text
- ra soat file co text scan duoc nhung gia tri gameplay thap

## Quy tac van hanh

1. `npm run translate:all`
2. neu bi ngat, chay lai cung lenh
3. xem dashboard tai `http://localhost:4173/`
4. neu muon khoi phuc output gan nhat, dung `npm run rollback:output`

## Log / bao cao

- `output/reports/translation-dashboard.json`
- `output/reports/translation-session.json`
- `output/reports/translation-events.ndjson`
- `output/rollback/`
