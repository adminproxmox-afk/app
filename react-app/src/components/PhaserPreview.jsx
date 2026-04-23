import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

export default function PhaserPreview() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    class PreviewScene extends Phaser.Scene {
      create() {
        this.score = 0;
        this.add.rectangle(180, 100, 360, 200, 0x0f1721, 0.85);
        this.add.grid(180, 100, 360, 200, 36, 36, 0x172331, 0.45, 0x2b3d52, 0.18);
        this.player = this.add.rectangle(58, 108, 28, 28, 0x77d1a8).setStrokeStyle(2, 0xe7fff5);
        this.coin = this.add.circle(275, 70, 13, 0xffcf42).setStrokeStyle(3, 0x7d5a00);
        this.botText = this.add.text(18, 16, 'Farm Bot Logic', {
          fontFamily: 'Inter, Segoe UI, sans-serif',
          fontSize: '16px',
          color: '#f7fbff',
          fontStyle: '700'
        });
        this.hint = this.add.text(18, 162, 'Phaser preview: бот збирає ресурс', {
          fontFamily: 'Inter, Segoe UI, sans-serif',
          fontSize: '12px',
          color: '#91a9c4'
        });
      }

      update(time) {
        const x = 58 + Math.abs(Math.sin(time / 900)) * 220;
        const y = 108 + Math.sin(time / 480) * 18;
        this.player.setPosition(x, y);
        this.coin.setScale(1 + Math.sin(time / 180) * 0.08);
      }
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: 360,
      height: 200,
      backgroundColor: 'transparent',
      transparent: true,
      scene: PreviewScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div className="phaser-preview" ref={hostRef} aria-label="Phaser game preview" />;
}
