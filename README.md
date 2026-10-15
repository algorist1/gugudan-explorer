# 🧭 구구단 탐험대

그림으로 이해하고(Visual Learning), 즉각적인 칭찬으로 자라는(Positive Reinforcement) 구구단 학습 웹앱입니다.
빌드 과정 없이 HTML·CSS·JavaScript만으로 동작하므로 Vercel에 그대로 올리면 됩니다.

## 폴더 구조

```
gugudan-explorer/
├── index.html            화면 뼈대
├── css/style.css         디자인과 애니메이션
├── js/app.js             모든 기능(외부 라이브러리 없음)
├── favicon.svg           아이콘
├── manifest.webmanifest  태블릿·크롬북 '홈 화면에 추가'용 정보
└── vercel.json           Vercel 배포 설정(보안·캐시 헤더)
```

## 주요 기능

| 메뉴 | 학습 설계 의도 |
|---|---|
| 🗺️ 탐험 지도 | 2~9단을 8개의 섬으로 표현, 섬마다 별 3개. 다음 추천 섬을 반짝임으로 안내 |
| 📖 배우기 | `a × b`를 **a개씩 b묶음** 그림과 **수직선 뛰어 세기**로 동시에 보여 주고, 묶음이 다 나타난 뒤 정답 공개(예측 → 확인) |
| 🎯 도전 | 10문제 4지선다. 오답 선택지를 흔한 실수(더하기 혼동, 한 묶음 차이 등)로 만들어 **틀린 이유를 짚어 주는 진단형 피드백** 제공 |
| 📒 오답 노트 | 틀린 문제를 자동 저장, 다시 맞히면 극복 기록 |
| 🔢 구구단 표 | 넓이(직사각형)로 보기, 교환법칙(주황 칸), 같은 곱 찾기, 단별 증가 규칙, 가리기 놀이 |
| 🏅 배지 | 연속 정답, 만점, 단 정복 등 19개 배지 |

- 정답: 색종이·효과음·칭찬 문구·연속 정답 불꽃 / 오답: 부드러운 소리와 격려, 그림 힌트 자동 표시
- 🔊 읽어 주기: 브라우저의 한국어 음성(Web Speech API)으로 "칠 곱하기 팔은 오십육"처럼 읽음
- 키보드: 도전에서 숫자 1~4로 답 고르기, Enter로 다음 문제 / 배우기에서 ←, →
- 기록은 각 기기 브라우저(localStorage)에만 저장되며 서버로 전송되지 않습니다.

## Vercel 배포 방법

### 방법 A. GitHub 연동 (추천 — 수정 후 push하면 자동 재배포)
1. GitHub에 새 저장소를 만들고 이 폴더의 파일을 모두 올립니다. (`index.html`이 저장소 최상위에 오도록)
2. https://vercel.com/new 에서 해당 저장소를 Import 합니다.
3. Framework Preset은 **Other**, Build Command와 Output Directory는 비워 둔 채 **Deploy**를 누릅니다.

### 방법 B. Vercel CLI
```bash
npm i -g vercel
cd gugudan-explorer
vercel          # 미리보기 배포
vercel --prod   # 실제 주소로 배포
```

## 내 컴퓨터에서 미리 보기
```bash
cd gugudan-explorer
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000
```

## 수업 활용 아이디어 (정보 수업 연계)
- `js/app.js`의 `THEMES`에서 섬 이름·그림(이모지)·색을 바꿔 **나만의 탐험대** 만들기
- `PRAISE` 배열에 학생이 직접 칭찬 문구 추가하기 → 배열과 무작위 선택 개념
- `makeChoices` 함수를 읽고 "왜 이런 오답을 보기로 냈을까?" 토의 → 알고리즘과 학습 설계 연결
