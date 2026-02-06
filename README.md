# mini-autobattle-game-codex

Phaser 3 클라이언트(`packages/client`)와 순수 JS 헤드리스 시뮬레이터(`packages/sim`)를 분리한 모노레포입니다.

> 현재 구현 범위: **티켓 1 + 티켓 2**
> - 워크스페이스/빌드/테스트 환경 구성
> - sim 데이터 스키마 + JSDoc typedef + 더미 데이터(챔피언 8 / 스킬 12)
> - 전투 코어 로직은 티켓 3부터 구현 예정

## 요구 환경

- Node.js 18+
- npm 9+

## 설치

```bash
npm install
```

## 실행

### 1) 클라이언트 개발 서버

```bash
npm run dev
```

- Vite 개발 서버가 실행됩니다.
- 현재는 Phaser 기본 화면과 팀 샘플 텍스트만 렌더링합니다.

### 2) 클라이언트 빌드 (정적 배포용)

```bash
npm run build
```

- `packages/client/dist` 출력물 생성

### 3) sim 테스트 실행 (Vitest)

```bash
npm run test
```

- 데이터 개수/기본 API shape smoke test 포함

### 4) sim 다회 실행 스크립트

```bash
npm run sim:run
```

- 현재는 placeholder `runMatch`를 100회 실행해 파이프라인을 검증

## 구조

```text
root/
  package.json
  packages/
    sim/
      src/
        index.js
        types.js
        rng.js
        data/
          champions.js
          skills.js
          tags.js
          synergies.js
        sim/
          World.js
          Unit.js
          Combat.js
          AI.js
          Effects.js
          Match.js
        metrics/
          Stats.js
          Logger.js
      test/
        match.smoke.test.js
        balance.run.test.js
    client/
      index.html
      vite.config.js
      src/
        main.js
        game/
          GameConfig.js
          scenes/
            BootScene.js
            MatchScene.js
            ResultScene.js
          render/
            UnitView.js
            ProjectileView.js
            FxView.js
```

## 다음 단계

- 티켓 3: fixed-step 헤드리스 전투 코어 + 결정론(seed) 강화
- 티켓 4: AI(FSM + 규칙 기반)
- 티켓 5: 태그 상성/팀 시너지 적용
- 티켓 6~7: Phaser 관전 렌더링 + 결과 통계 화면


## 티켓 3~7 작업 준비 문서

- 상세 준비 계획: `docs/작업기록_및_티켓3-7_준비계획.md`
- 협업/언어/커밋/PR 규칙: `CONTRIBUTING.md`
