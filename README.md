# 광진정보도서관 여름 프로젝트

학생이 만든 게임과 창작 프로젝트를 소개하는 작품 허브입니다. 루트의 `index.html`은 별도 빌드 없이 정적 호스팅에서 바로 열립니다.

## 작품 추가 방법

1. 학생 작품을 새 폴더에 넣고, 정적 작품이라면 폴더 안에 `index.html`을 둡니다.
2. 루트 `games.js`에 아래 형식으로 작품을 추가합니다.

```js
{
  id: 'unique-id',
  title: '작품명',
  creator: '제작자',
  genre: 'game', // game / collection / community
  emoji: '🎮',
  color: 'sky', // sky / violet / lime / coral / blue / yellow
  description: '작품 소개 한 문장',
  url: 'student-folder/'
}
```

카드 수, 검색, 종류별 필터는 자동으로 반영됩니다. `orgil4769-gif`처럼 시작 파일명이 `index.html`이 아닌 작품은 폴더 안에 해당 파일로 연결하는 `index.html`을 추가해야 폴더 링크가 정상 작동합니다.

## 실행 환경 안내

대부분의 작품은 정적 호스팅(GitHub Pages 등)에서 작동합니다. `oooj13`의 Nodeboard는 게시글·댓글 API를 포함한 Node.js/Express 프로젝트이므로 정적 호스팅만으로는 저장 기능을 제공할 수 없습니다. 해당 작품은 `oooj13` 폴더에서 의존성을 설치한 뒤 `npm run dev`로 실행해야 합니다.
