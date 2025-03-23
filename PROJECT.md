# VRM Playground Project

## 프로젝트 개요
VRM 캐릭터를 사용하여 웹 기반 3D 인터랙티브 환경을 구현하는 프로젝트입니다. 사용자의 얼굴 표정을 인식하여 VRM 캐릭터에 반영하고, 3D 환경에서 자유롭게 이동할 수 있는 기능을 제공합니다.

## 기술 스택
- Three.js: 3D 렌더링 엔진
- React: UI 프레임워크
- React Three Fiber: Three.js의 React 래퍼
- Vite: 빌드 도구
- TypeScript: 타입 안정성
- MediaPipe Face Mesh: 얼굴 표정 인식
- @pixiv/three-vrm: VRM 모델 지원

## 주요 기능
1. VRM 캐릭터 렌더링
   - VRM 모델 로딩 및 표시
   - 캐릭터 애니메이션 시스템

2. 얼굴 표정 인식
   - 웹캠을 통한 실시간 얼굴 추적
   - MediaPipe Face Mesh를 사용한 표정 인식
   - VRM 캐릭터의 블렌드쉐이프 매핑

3. 3D 환경 이동
   - WASD 키를 통한 캐릭터 이동
   - 우측 방향키를 통한 카메라 회전
   - 메시 기반 지형 시스템

## 프로젝트 구조
```
src/
├── components/
│   ├── Scene.tsx          # 메인 3D 씬
│   ├── Character.tsx      # VRM 캐릭터 컴포넌트
│   ├── Terrain.tsx        # 지형 컴포넌트
│   └── Camera.tsx         # 카메라 컨트롤
├── hooks/
│   ├── useFaceTracking.ts # 얼굴 추적 훅
│   └── useCharacterMovement.ts # 캐릭터 이동 훅
├── utils/
│   ├── faceMesh.ts        # MediaPipe Face Mesh 유틸리티
│   └── vrmLoader.ts       # VRM 로더 유틸리티
├── types/
│   └── index.ts           # 타입 정의
└── App.tsx                # 메인 애플리케이션
```

## 개발 단계
1. 프로젝트 초기 설정
   - Vite + React + TypeScript 프로젝트 생성
   - 필요한 의존성 설치
   - 기본 프로젝트 구조 설정

2. 3D 환경 구현
   - Three.js 씬 설정
   - 기본 지형 메시 생성
   - 카메라 컨트롤 구현

3. VRM 캐릭터 통합
   - VRM 로더 구현
   - 캐릭터 렌더링
   - 기본 애니메이션 설정

4. 얼굴 추적 시스템
   - MediaPipe Face Mesh 통합
   - 웹캠 스트림 처리
   - VRM 블렌드쉐이프 매핑

5. 이동 시스템
   - WASD 키 입력 처리
   - 캐릭터 이동 로직
   - 카메라 회전 시스템

6. 최적화 및 테스트
   - 성능 최적화
   - 브라우저 호환성 테스트
   - 사용자 테스트

## 실행 방법
1. 의존성 설치
```bash
npm install
```

2. 개발 서버 실행
```bash
npm run dev
```

3. 프로덕션 빌드
```bash
npm run build
```

## 주의사항
- 웹캠 접근 권한이 필요합니다
- 최신 브라우저에서 최적의 성능을 보장합니다
- VRM 파일은 별도로 준비해야 합니다 