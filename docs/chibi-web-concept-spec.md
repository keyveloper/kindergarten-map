# Chibi Web Concept Spec

## Purpose

우리동네 유치원 웹사이트의 다음 시각 개편 또는 신규 페이지 제작 시, 치비 스타일을 단순 장식이 아니라 부모가 편하게 읽고 탐색할 수 있는 UX 언어로 적용한다.

핵심 방향은 "밝고 귀엽지만, 정보는 믿을 수 있게"이다. 치비 캐릭터와 둥근 일러스트는 첫인상과 안내감을 만들고, 유치원 정보/지도/블로그 콘텐츠는 가독성과 탐색성을 우선한다.

## Concept

- Style: chibi, playful, parent-friendly, kindergarten, soft editorial
- Mood: warm, safe, cheerful, helpful, approachable
- Product role: 유치원 정보 탐색 + 부모 대상 블로그 콘텐츠
- Visual principle: 캐릭터는 보조 안내자, 정보 콘텐츠는 주인공
- UX principle: 귀여움보다 명확성, 장식보다 탐색 성공

## Visual Direction

- 캐릭터 비율은 큰 머리, 작은 몸, 둥근 손/발, 단순 표정으로 유지한다.
- 캐릭터는 hero, empty state, onboarding hint, section marker, blog category thumbnail에 제한적으로 사용한다.
- 정보 카드, 지도, 글 목록, CTA는 과도한 일러스트보다 읽기 쉬운 구조를 우선한다.
- 둥근 형태를 쓰되 모든 요소가 과하게 말랑해 보이지 않도록 8px 기준의 카드 radius를 기본으로 한다.
- 배경은 밝은 종이 느낌 또는 부드러운 pastel surface를 사용하고, 본문 대비는 WCAG AA 이상을 목표로 한다.
- 아이콘은 emoji 대신 Lucide 또는 일관된 SVG 아이콘을 사용한다.

## Palette Keywords

- soft pastel
- warm ivory
- strawberry accent
- sky blue accent
- mint helper
- sunshine yellow highlight
- ink text
- paper surface

색상은 한 가지 색 계열로만 밀지 않는다. 핑크/민트/스카이/옐로우를 작은 면적으로 나누어 쓰고, 본문 텍스트는 짙은 ink 계열로 고정한다.

## Typography

- Brand: Jua 400으로 친근한 인상을 주되 로고 영역에만 제한한다.
- Heading: Pretendard Variable 750-850, 자간 -0.035em으로 둥글고 단단한 정보 위계를 만든다.
- Body: Pretendard Variable 400-500, 데스크톱 17-18px/행간 1.72-1.9, 모바일 최소 16px을 유지한다.
- 제목은 선명하고 자신 있게, 설명과 데이터는 차분하고 읽기 쉽게 분리한다.
- 글의 문체는 부모를 가르치기보다 함께 확인하는 말투를 사용한다. 불안을 자극하거나 단정하지 않는다.

## Design Tokens

- Primary: strawberry coral `#D95D6C`, hover `#BF4656`, 흰색 텍스트
- Secondary: calm teal `#287D75`, 정보·보조 행동·상태 표시
- Accent: sunshine yellow `#FFD85A`, 작은 강조와 치비 장식에만 사용
- Canvas: warm ivory `#FFF9ED`, Surface: paper white `#FFFEFA`
- Text: ink `#342E2B`, Muted `#625B57`
- Border: `#EADFCE`, strong border `#D8C8B1`
- Radius: card 20px, control 12-14px, image 20px
- Shadow: 큰 검은 외곽선 대신 낮은 대비의 warm brown shadow를 사용한다.

## Layout

- Mobile first: 375px 기준에서 가로 스크롤이 없어야 한다.
- Hero는 캐릭터/일러스트가 분위기를 만들되, 첫 화면에서 검색/지도/블로그 진입 CTA가 명확해야 한다.
- 블로그 목록은 카드형이 가능하지만, 카드 안의 제목/요약/태그가 장식에 밀리지 않아야 한다.
- 지도/검색 화면은 playful shell보다 조작 효율을 우선한다.
- 반복 카드 사이즈와 이미지 aspect-ratio를 고정해 hover, loading, 긴 텍스트 때문에 레이아웃이 흔들리지 않게 한다.

## Motion

- 치비 느낌의 모션은 bounce가 아니라 soft pop, gentle float, tiny nod 정도로 제한한다.
- 마이크로 인터랙션은 150-300ms를 기본으로 한다.
- 무한 반복 장식 애니메이션은 피하고, loading/feedback처럼 의미 있는 상태에만 사용한다.
- prefers-reduced-motion을 반드시 지원한다.
- transform/opacity 위주로 구현하고 width/height/top/left 애니메이션은 피한다.

## UX Keywords For Agents

아래 키워드는 디자인/프론트엔드 에이전트에게 그대로 전달할 수 있다.

- chibi character guide
- parent-friendly kindergarten UX
- playful but trustworthy
- soft pastel design system
- rounded educational interface
- content-first cute UI
- friendly mascot helper
- paper-like surface
- warm onboarding cues
- gentle micro-interactions
- soft pop animation
- reduced-motion friendly
- mobile-first readable layout
- no horizontal scroll at 375px
- accessible pastel contrast
- clear primary CTA
- card grid with stable aspect ratio
- map/search usability first
- blog readability first
- SVG icons instead of emoji

## Page-Level Usage

- Home: 치비 캐릭터와 유치원 지도/블로그 진입 CTA를 함께 보여준다.
- Blog index: 카테고리별 작은 치비 오브젝트는 가능하지만, 제목/요약/작성일/태그 위계가 우선이다.
- Blog detail: 본문은 장식 최소화, note/image/callout에만 부드러운 캐릭터 요소를 제한적으로 쓴다.
- Blog imagery: 모든 게시글에 주제별 치비 장면 2장을 배치한다. 첫 이미지는 요약 다음, 두 번째는 본문 중간에 두며 1200x800 WebP로 제공한다.
- Map: 지도 조작, 필터, 검색 결과 가독성이 우선이다. 치비 요소는 empty/loading/help 상태에만 사용한다.
- About/Terms/Privacy: 신뢰와 명확성이 우선이므로 치비 장식은 최소화한다.

## Avoid

- 귀여운 이미지가 본문이나 CTA를 가리는 구성
- emoji를 구조적 아이콘처럼 사용하는 방식
- pastel 색상만으로 의미를 전달하는 방식
- 모든 카드/섹션을 과하게 둥글고 큰 장식 박스로 만드는 방식
- 무한 bounce, 과한 parallax, 500ms 이상의 느린 UI 애니메이션
- 모바일에서 긴 제목/버튼 텍스트가 깨지는 구성
- 유치원 정보 사이트가 게임/캐릭터 랜딩처럼 보이는 톤

## Acceptance Checklist

- 375px, 768px, 1024px, 1440px에서 주요 레이아웃이 깨지지 않는다.
- 모바일에서 page-level horizontal scroll이 없다.
- 모든 주요 CTA는 한 화면 안에서 역할이 명확하다.
- 본문 텍스트 대비는 4.5:1 이상을 목표로 한다.
- 캐릭터/일러스트에는 width/height 또는 aspect-ratio가 지정되어 CLS를 막는다.
- 인터랙션 요소는 최소 44px 터치 영역을 확보한다.
- keyboard focus와 visible focus ring을 유지한다.
- reduced-motion 환경에서 장식 모션이 제거되거나 약화된다.
