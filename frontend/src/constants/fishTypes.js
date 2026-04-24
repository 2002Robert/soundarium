// Mỗi loài cá có hình dáng khác nhau khi vẽ trên Canvas
export const LOAI_CA = {
  ca_vang: {
    ten: 'Cá Vàng',
    // Tỉ lệ thân/đuôi để vẽ
    tyLeThan: 1.4,
    tyLeDuoi: 0.6,
    baoGomVay: true,
  },
  ca_neon: {
    ten: 'Cá Neon',
    tyLeThan: 1.2,
    tyLeDuoi: 0.5,
    baoGomVay: false,
  },
  ca_betta: {
    ten: 'Cá Betta',
    tyLeThan: 1.3,
    tyLeDuoi: 0.9,  // đuôi dài
    baoGomVay: true,
  },
  ca_clownfish: {
    ten: 'Cá Hề',
    tyLeThan: 1.1,
    tyLeDuoi: 0.5,
    baoGomVay: true,
  },
  ca_tang: {
    ten: 'Cá Tang',
    tyLeThan: 1.0,
    tyLeDuoi: 0.55,
    baoGomVay: false,
  },
  ca_angel: {
    ten: 'Cá Thiên Thần',
    tyLeThan: 0.9,
    tyLeDuoi: 0.8,
    baoGomVay: true,
  },
  ca_guppy: {
    ten: 'Cá Guppy',
    tyLeThan: 1.1,
    tyLeDuoi: 0.7,
    baoGomVay: false,
  },
  ca_tetra: {
    ten: 'Cá Tetra',
    tyLeThan: 1.3,
    tyLeDuoi: 0.5,
    baoGomVay: false,
  },
}

export const KICH_THUOC_THEO_LEVEL = { 1: 40, 2: 52, 3: 64, 4: 72, 5: 80 }
