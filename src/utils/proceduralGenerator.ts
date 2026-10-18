import { BloomLevel, GeneratedExercise } from '../types/optics';
import { calculateRefraction, SPEED_OF_LIGHT } from './optics';

interface GenerateOptions {
  level: BloomLevel;
  topic?: string;
  lang?: 'vi' | 'en';
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateProceduralExercise(opts: GenerateOptions): GeneratedExercise {
  const { level, lang = 'vi' } = opts;
  const isEn = lang === 'en';

  if (level === 'nhan_biet') {
    const templates = [
      {
        titleVi: 'Nhận biết góc tới và góc khúc xạ',
        titleEn: 'Identifying Incident and Refracted Angles',
        questionVi: 'Trong thí nghiệm khúc xạ ánh sáng, tia tới tạo với mặt phân cách một góc α = 40°. Góc tới i có giá trị là bao nhiêu?',
        questionEn: 'In a refraction experiment, the incident ray makes an angle α = 40° with the interface surface. What is the angle of incidence i?',
        correct: '50°',
        distractors: ['40°', '90°', '140°'],
        explanationVi: 'Góc tới i là góc hợp bởi tia tới và pháp tuyến. Vì pháp tuyến vuông góc với mặt phân cách (90°) nên: i = 90° - α = 90° - 40° = 50°.',
        explanationEn: 'The incident angle i is between the incident ray and the normal. Since the normal is 90° to the surface: i = 90° - 40° = 50°.',
        takeawayVi: 'Luôn nhớ góc tới i được tính so với PHÁP TUYẾN, không phải so với mặt phân cách!',
        takeawayEn: 'Always measure incident angle i with respect to the NORMAL line, not the surface!',
        n1: 1.0,
        n2: 1.333,
        i: 50,
      },
      {
        titleVi: 'Nhận diện các đại lượng quang hình',
        titleEn: 'Identifying Optical Components',
        questionVi: 'Đường thẳng vuông góc với mặt phân cách giữa hai môi trường tại điểm tới được gọi là gì?',
        questionEn: 'What is the straight line perpendicular to the interface boundary at the point of incidence called?',
        correct: isEn ? 'Normal line (NN\')' : 'Pháp tuyến (NN\')',
        distractors: isEn
          ? ['Incident ray (SI)', 'Refracted ray (IR)', 'Plane of incidence']
          : ['Tia tới (SI)', 'Tia khúc xạ (IR)', 'Mặt phẳng tới'],
        explanationVi: 'Theo định nghĩa trong KHTN 9, pháp tuyến là đường thẳng vuông góc với mặt phân cách tại điểm tới I.',
        explanationEn: 'By definition, the normal line is perpendicular to the boundary at the point of incidence I.',
        takeawayVi: 'Pháp tuyến luôn tạo góc 90° với mặt phân cách tại điểm tới I.',
        takeawayEn: 'The normal is strictly at 90° to the interface surface.',
        n1: 1.0,
        n2: 1.5,
        i: 35,
      },
    ];

    const pick = getRandomItem(templates);
    const options = [pick.correct, ...pick.distractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(pick.correct);

    return {
      id: `ai-${Date.now()}-${getRandomInt(100, 999)}`,
      createdAt: Date.now(),
      level,
      topic: 'Nhận biết khái niệm',
      title: isEn ? pick.titleEn : pick.titleVi,
      question: isEn ? pick.questionEn : pick.questionVi,
      options,
      correctAnswerIndex: correctIndex,
      explanation: isEn ? pick.explanationEn : pick.explanationVi,
      keyTakeaway: isEn ? pick.takeawayEn : pick.takeawayVi,
      simulationParams: {
        n1: pick.n1,
        n2: pick.n2,
        incidentAngle: pick.i,
      },
    };
  }

  if (level === 'thong_hieu') {
    const isDenserToRarer = Math.random() > 0.5;
    if (isDenserToRarer) {
      // n1 > n2 (water to air or glass to air)
      const mediaList = [
        { nameVi: 'Nước (n = 1.33)', nameEn: 'Water (n = 1.33)', n: 1.333 },
        { nameVi: 'Thủy tinh (n = 1.50)', nameEn: 'Glass (n = 1.50)', n: 1.500 },
      ];
      const m = getRandomItem(mediaList);
      const iVal = getRandomInt(15, 35);
      const res = calculateRefraction(m.n, 1.0, iVal);
      const correct = isEn
        ? `Refracted angle r > ${iVal}° (bends away from normal)`
        : `Góc khúc xạ r > ${iVal}° (lệch xa pháp tuyến hơn)`;
      const distractors = isEn
        ? [
            `Refracted angle r < ${iVal}° (bends towards normal)`,
            `Refracted angle r = ${iVal}° (no deviation)`,
            'Total internal reflection occurs for any angle',
          ]
        : [
            `Góc khúc xạ r < ${iVal}° (lệch lại gần pháp tuyến hơn)`,
            `Góc khúc xạ r = ${iVal}° (không bị lệch)`,
            'Bị phản xạ toàn phần với mọi giá trị góc tới',
          ];
      const options = [correct, ...distractors].sort(() => Math.random() - 0.5);

      return {
        id: `ai-${Date.now()}-${getRandomInt(100, 999)}`,
        createdAt: Date.now(),
        level,
        topic: 'Chiều lệch tia sáng',
        title: isEn
          ? `Refraction from ${m.nameEn} to Air`
          : `Khúc xạ từ ${m.nameVi} ra Không khí`,
        question: isEn
          ? `A light ray travels from ${m.nameEn} into Air (n = 1.0) with incident angle i = ${iVal}°. What is the behavior of the refracted ray?`
          : `Chiếu một tia sáng từ ${m.nameVi} ra Không khí (n = 1.0) với góc tới i = ${iVal}°. So sánh góc khúc xạ r và góc tới i?`,
        options,
        correctAnswerIndex: options.indexOf(correct),
        explanation: isEn
          ? `Because n1 (${m.n}) > n2 (1.0), light enters an optically rarer medium. According to Snell's law: sin(r) = (n1/n2) · sin(i) > sin(i), so r > i (calculated r ≈ ${res.refractedAngleDeg?.toFixed(1)}°). The ray bends AWAY from the normal.`
          : `Vì n1 (${m.n}) > n2 (1.0), môi trường 2 chiết quang kém hơn môi trường 1. Theo định luật Snell: sin(r) = (${m.n}/1.0) · sin(${iVal}°) > sin(${iVal}°) ⇒ r > i (tính ra r ≈ ${res.refractedAngleDeg?.toFixed(1)}°). Tia khúc xạ lệch RA XA pháp tuyến.`,
        keyTakeaway: isEn
          ? 'n1 > n2 ⇒ r > i: Ray bends away from the normal.'
          : 'n1 > n2 ⇒ r > i: Tia khúc xạ lệch ra xa pháp tuyến.',
        simulationParams: {
          n1: m.n,
          n2: 1.0,
          incidentAngle: iVal,
        },
      };
    } else {
      // n1 < n2 (air to glass/water)
      const iVal = getRandomInt(30, 65);
      const correct = isEn
        ? `Refracted angle r < ${iVal}° (bends towards normal)`
        : `Góc khúc xạ r < ${iVal}° (lệch lại gần pháp tuyến)`;
      const distractors = isEn
        ? [
            `Refracted angle r > ${iVal}° (bends away from normal)`,
            `Refracted angle r = ${iVal}° (straight path)`,
            'Total internal reflection occurs',
          ]
        : [
            `Góc khúc xạ r > ${iVal}° (lệch xa pháp tuyến)`,
            `Góc khúc xạ r = ${iVal}° (truyền thẳng)`,
            'Xảy ra hiện tượng phản xạ toàn phần',
          ];
      const options = [correct, ...distractors].sort(() => Math.random() - 0.5);

      return {
        id: `ai-${Date.now()}-${getRandomInt(100, 999)}`,
        createdAt: Date.now(),
        level,
        topic: 'Chiều lệch tia sáng',
        title: isEn ? 'Light Ray Traveling from Air to Glass' : 'Tia sáng truyền từ Không khí vào Thủy tinh',
        question: isEn
          ? `When light passes from air (n1 = 1.0) into glass (n2 = 1.5) at i = ${iVal}°, how does angle r compare to i?`
          : `Khi chiếu tia sáng từ không khí (n1 = 1.0) vào thủy tinh (n2 = 1.5) với góc tới i = ${iVal}°, góc khúc xạ r có đặc điểm gì?`,
        options,
        correctAnswerIndex: options.indexOf(correct),
        explanation: isEn
          ? `Since n1 < n2 (1.0 < 1.5), light slows down and bends TOWARDS the normal, meaning r < i.`
          : `Do n1 < n2 (1.0 < 1.5), thủy tinh chiết quang hơn không khí nên tia khúc xạ bị bẻ cong LẠI GẦN pháp tuyến hơn, nghĩa là r < i.`,
        keyTakeaway: isEn
          ? 'n1 < n2 ⇒ r < i: Ray bends towards the normal.'
          : 'n1 < n2 ⇒ r < i: Tia khúc xạ lệch lại gần pháp tuyến.',
        simulationParams: {
          n1: 1.0,
          n2: 1.5,
          incidentAngle: iVal,
        },
      };
    }
  }

  if (level === 'van_dung') {
    // Generate real numerical calculation
    const pair = getRandomItem([
      { n1: 1.0, n2: 1.333, n1Name: 'Không khí', n2Name: 'Nước', n1En: 'Air', n2En: 'Water' },
      { n1: 1.0, n2: 1.500, n1Name: 'Không khí', n2Name: 'Thủy tinh', n1En: 'Air', n2En: 'Glass' },
      { n1: 1.0, n2: 1.620, n1Name: 'Không khí', n2Name: 'Thủy tinh Flint', n1En: 'Air', n2En: 'Flint Glass' },
    ]);

    const angleI = getRandomItem([20, 30, 35, 45, 50, 60]);
    const res = calculateRefraction(pair.n1, pair.n2, angleI);
    const rTrue = res.refractedAngleDeg!.toFixed(1);

    const distractor1 = (parseFloat(rTrue) + 5.5).toFixed(1);
    const distractor2 = Math.max(5, parseFloat(rTrue) - 6.2).toFixed(1);
    const distractor3 = (angleI * (pair.n1 / pair.n2)).toFixed(1); // common mistake: r = i * (n1/n2)

    const correct = `${rTrue}°`;
    const distractors = [`${distractor1}°`, `${distractor2}°`, `${distractor3}°`];
    const options = [correct, ...distractors].sort(() => Math.random() - 0.5);

    return {
      id: `ai-${Date.now()}-${getRandomInt(100, 999)}`,
      createdAt: Date.now(),
      level,
      topic: 'Tính toán góc khúc xạ',
      title: isEn
        ? `Calculate Refracted Angle from ${pair.n1En} to ${pair.n2En}`
        : `Tính góc khúc xạ từ ${pair.n1Name} vào ${pair.n2Name}`,
      question: isEn
        ? `A light ray strikes from ${pair.n1En} (n1 = ${pair.n1}) into ${pair.n2En} (n2 = ${pair.n2}) with incident angle i = ${angleI}°. Calculate the angle of refraction r.`
        : `Chiếu tia sáng từ ${pair.n1Name} (n1 = ${pair.n1}) vào ${pair.n2Name} (n2 = ${pair.n2}) với góc tới i = ${angleI}°. Hãy tính góc khúc xạ r.`,
      options,
      correctAnswerIndex: options.indexOf(correct),
      explanation: isEn
        ? `1. State Snell's law: n1 · sin(i) = n2 · sin(r)\n` +
          `2. Substitute knowns: ${pair.n1} · sin(${angleI}°) = ${pair.n2} · sin(r)\n` +
          `3. Solve for sin(r): sin(r) = (${pair.n1} · ${Math.sin((angleI * Math.PI) / 180).toFixed(4)}) / ${pair.n2} = ${(
            (pair.n1 * Math.sin((angleI * Math.PI) / 180)) /
            pair.n2
          ).toFixed(4)}\n` +
          `4. Calculate r: r = arcsin(...) ≈ ${rTrue}°.`
        : `1. Áp dụng định luật Snell: n1 · sin(i) = n2 · sin(r)\n` +
          `2. Thay số: ${pair.n1} · sin(${angleI}°) = ${pair.n2} · sin(r)\n` +
          `3. Rút ra: sin(r) = (${pair.n1} · ${Math.sin((angleI * Math.PI) / 180).toFixed(4)}) / ${pair.n2} = ${(
            (pair.n1 * Math.sin((angleI * Math.PI) / 180)) /
            pair.n2
          ).toFixed(4)}\n` +
          `4. Bấm máy tính: r = arcsin(...) ≈ ${rTrue}°.`,
      keyTakeaway: isEn
        ? `Formula: sin(r) = (n1 · sin(i)) / n2`
        : `Công thức: sin(r) = (n1 · sin(i)) / n2`,
      simulationParams: {
        n1: pair.n1,
        n2: pair.n2,
        incidentAngle: angleI,
      },
    };
  }

  // level === 'van_dung_cao'
  const scenarios = [
    {
      titleVi: 'Góc tới hạn phản xạ toàn phần của Kim cương',
      titleEn: 'Critical Angle of Diamond in Air',
      questionVi: 'Kim cương có chiết suất n = 2.42. Tính góc tới hạn igh khi tia sáng truyền từ kim cương ra không khí (n = 1.0). Nếu chiếu với góc tới i = 30° thì hiện tượng gì sẽ xảy ra?',
      questionEn: 'Diamond has index n = 2.42. Calculate critical angle igh for diamond to air (n = 1.0). What happens if incident angle is i = 30°?',
      correct: isEn
        ? 'igh ≈ 24.4°; Total Internal Reflection occurs because i = 30° > igh'
        : 'igh ≈ 24.4°; Xảy ra Phản xạ toàn phần vì i = 30° > igh',
      distractors: isEn
        ? [
            'igh ≈ 48.8°; Light refracts into air at r ≈ 45°',
            'igh ≈ 24.4°; Light refracts into air at r = 60°',
            'igh ≈ 65.5°; Ray is completely absorbed by diamond',
          ]
        : [
            'igh ≈ 48.8°; Tia sáng khúc xạ ra không khí với r ≈ 45°',
            'igh ≈ 24.4°; Tia sáng khúc xạ ra không khí với r = 60°',
            'igh ≈ 65.5°; Tia sáng bị kim cương hấp thụ hoàn toàn',
          ],
      explanationVi: 'Ta có sin(igh) = n2 / n1 = 1.0 / 2.42 ≈ 0.4132 ⇒ igh = arcsin(0.4132) ≈ 24.4°. Vì góc tới i = 30° lớn hơn góc tới hạn igh (30° > 24.4°) và ánh sáng truyền từ môi trường chiết quang hơn sang kém hơn nên xảy ra PHẢN XẠ TOÀN PHẦN. Toàn bộ tia sáng bị phản xạ trở lại trong kim cương.',
      explanationEn: 'sin(igh) = n2 / n1 = 1.0 / 2.42 ≈ 0.4132 ⇒ igh ≈ 24.4°. Because incident angle i = 30° > 24.4° and light travels from denser to rarer medium, TOTAL INTERNAL REFLECTION occurs.',
      takeawayVi: 'Điều kiện phản xạ toàn phần: n1 > n2 và i ≥ igh với sin(igh) = n2 / n1.',
      takeawayEn: 'TIR conditions: n1 > n2 and i ≥ igh where sin(igh) = n2 / n1.',
      n1: 2.417,
      n2: 1.0,
      i: 30,
    },
    {
      titleVi: 'Độ sâu biểu kiến của hòn sỏi dưới đáy bể bơi',
      titleEn: 'Apparent Depth of a Pebble at the Pool Bottom',
      questionVi: 'Một hòn sỏi nằm ở đáy bể bơi sâu h = 1.2 m. Nước có chiết suất n = 1.33. Người quan sát đứng trên bờ nhìn gần như thẳng đứng sẽ thấy hòn sỏi cách mặt nước một khoảng biểu kiến h\' xấp xỉ bao nhiêu?',
      questionEn: 'A pebble lies at the bottom of a pool at depth h = 1.2 m. Water has index n = 1.33. An observer looking nearly vertically sees the pebble at an apparent depth h\' of approximately:',
      correct: '0.90 m (90 cm)',
      distractors: ['1.20 m (120 cm)', '1.60 m (160 cm)', '0.60 m (60 cm)'],
      explanationVi: 'Với góc nhìn nhỏ gần như vuông góc, công thức độ sâu biểu kiến là: h\' = h / n = 1.2 / 1.333 ≈ 0.90 m = 90 cm. Đáy bể bơi trông như bị nâng lên 30 cm!',
      explanationEn: 'For nearly vertical observation, apparent depth is h\' = h / n = 1.2 / 1.333 ≈ 0.90 m. The bottom appears elevated by 30 cm.',
      takeawayVi: 'Nhìn từ ngoài vào nước: h\' = h / n (ảnh ảo trông nông hơn vật thật).',
      takeawayEn: 'Looking from air into water: h\' = h / n (virtual image appears shallower).',
      n1: 1.333,
      n2: 1.0,
      i: 15,
    },
  ];

  const pick = getRandomItem(scenarios);
  const options = [pick.correct, ...pick.distractors].sort(() => Math.random() - 0.5);

  return {
    id: `ai-${Date.now()}-${getRandomInt(100, 999)}`,
    createdAt: Date.now(),
    level,
    topic: 'Vận dụng cao & Thực tế',
    title: isEn ? pick.titleEn : pick.titleVi,
    question: isEn ? pick.questionEn : pick.questionVi,
    options,
    correctAnswerIndex: options.indexOf(pick.correct),
    explanation: isEn ? pick.explanationEn : pick.explanationVi,
    keyTakeaway: isEn ? pick.takeawayEn : pick.takeawayVi,
    simulationParams: {
      n1: pick.n1,
      n2: pick.n2,
      incidentAngle: pick.i,
    },
  };
}
