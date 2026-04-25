import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import type { GameWithMeta, Reward } from '../types';

type PhaserPreviewProps = {
  game: GameWithMeta;
  sessionKey: number;
  onComplete: (reward: Reward) => void;
};

type PhysicsShape = Phaser.GameObjects.Rectangle | Phaser.GameObjects.Arc | Phaser.GameObjects.Ellipse;

export default function PhaserPreview({ game, sessionKey, onComplete }: PhaserPreviewProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let rewardSent = false;

    class SkillRunScene extends Phaser.Scene {
      private player!: Phaser.GameObjects.Rectangle;
      private playerBody!: Phaser.Physics.Arcade.Body;
      private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      private wasd!: Record<'W' | 'A' | 'S' | 'D' | 'R', Phaser.Input.Keyboard.Key>;
      private resources: PhysicsShape[] = [];
      private hazards: PhysicsShape[] = [];
      private hudMeta!: Phaser.GameObjects.Text;
      private overlay!: Phaser.GameObjects.Container;
      private timerEvent?: Phaser.Time.TimerEvent;
      private level = 1;
      private target = 4;
      private collected = 0;
      private timeLeft = 28;
      private finished = false;

      create() {
        this.cameras.main.setBackgroundColor('#0b1117');
        this.add.rectangle(320, 180, 640, 360, 0x0d1723, 1);
        this.add.grid(320, 180, 640, 360, 40, 40, 0x1b2a3d, 0.18, 0x304763, 0.12);
        this.add.circle(78, 62, 84, Phaser.Display.Color.HexStringToColor(game.accent).color, 0.14);
        this.add.circle(560, 300, 106, 0x77d1a8, 0.08);
        this.add.text(22, 18, game.title, {
          fontFamily: 'Segoe UI, Arial, sans-serif',
          fontSize: '22px',
          color: '#f7fbff',
          fontStyle: '700'
        });

        this.hudMeta = this.add.text(22, 52, '', {
          fontFamily: 'Segoe UI, Arial, sans-serif',
          fontSize: '13px',
          color: '#9fb4cb'
        });

        this.add.text(22, 320, 'Стрілки або WASD. Збери всі вузли та не торкайся загроз.', {
          fontFamily: 'Segoe UI, Arial, sans-serif',
          fontSize: '13px',
          color: '#d7e6f4'
        });

        this.player = this.add.rectangle(96, 186, 28, 28, 0x77d1a8).setStrokeStyle(3, 0xe6fff4);
        this.physics.add.existing(this.player);
        this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        this.playerBody.setCollideWorldBounds(true);
        this.playerBody.setDrag(540, 540);
        this.playerBody.setMaxVelocity(220, 220);
        this.playerBody.setCircle(14);

        this.physics.world.setBounds(18, 86, 604, 216);

        this.cursors = this.input.keyboard?.createCursorKeys() || ({} as Phaser.Types.Input.Keyboard.CursorKeys);
        this.wasd = this.input.keyboard?.addKeys('W,A,S,D,R') as Record<'W' | 'A' | 'S' | 'D' | 'R', Phaser.Input.Keyboard.Key>;

        this.overlay = this.add.container(320, 182).setVisible(false);
        const overlayBg = this.add.rectangle(0, 0, 292, 132, 0x09111b, 0.92).setStrokeStyle(2, 0x4e9cff, 0.45);
        const overlayTitle = this.add.text(0, -20, '', {
          fontFamily: 'Segoe UI, Arial, sans-serif',
          fontSize: '22px',
          color: '#ffffff',
          fontStyle: '700'
        }).setOrigin(0.5);
        overlayTitle.name = 'title';
        const overlayBody = this.add.text(0, 18, '', {
          fontFamily: 'Segoe UI, Arial, sans-serif',
          fontSize: '13px',
          color: '#b8cde1',
          align: 'center',
          wordWrap: { width: 240 }
        }).setOrigin(0.5);
        overlayBody.name = 'body';
        this.overlay.add([overlayBg, overlayTitle, overlayBody]);

        this.startLevel(1);
      }

      startLevel(level: number) {
        this.level = level;
        this.target = 3 + level;
        this.collected = 0;
        this.timeLeft = 22 + level * 6;
        this.finished = false;
        this.overlay.setVisible(false);
        this.clearObjects();
        this.player.setPosition(96, 186);
        this.playerBody.setVelocity(0, 0);
        this.spawnResources(this.target);
        this.spawnHazards(level + (game.difficulty === 'hard' ? 2 : game.difficulty === 'mid' ? 1 : 0));
        this.timerEvent?.remove(false);
        this.timerEvent = this.time.addEvent({
          delay: 1000,
          loop: true,
          callback: () => {
            if (this.finished) return;
            this.timeLeft -= 1;
            this.syncHud();
            if (this.timeLeft <= 0) {
              this.failRun();
            }
          }
        });
        this.syncHud();
      }

      clearObjects() {
        this.resources.forEach((resource) => resource.destroy());
        this.hazards.forEach((hazard) => hazard.destroy());
        this.resources = [];
        this.hazards = [];
      }

      spawnResources(count: number) {
        for (let index = 0; index < count; index += 1) {
          const crystal = this.add.ellipse(
            Phaser.Math.Between(170, 576),
            Phaser.Math.Between(116, 276),
            24,
            24,
            0xffcf42
          ).setStrokeStyle(3, 0xfff0ad);
          this.physics.add.existing(crystal);
          const body = crystal.body as Phaser.Physics.Arcade.Body;
          body.setAllowGravity(false);
          body.setImmovable(true);
          this.physics.add.overlap(this.player, crystal, () => {
            if (!crystal.active || this.finished) return;
            crystal.destroy();
            this.resources = this.resources.filter((entry) => entry !== crystal);
            this.collected += 1;
            this.syncHud();

            if (this.collected >= this.target) {
              if (this.level >= 3) {
                this.winRun();
              } else {
                this.startLevel(this.level + 1);
              }
            }
          });
          this.resources.push(crystal);
        }
      }

      spawnHazards(count: number) {
        for (let index = 0; index < count; index += 1) {
          const hazard = this.add.rectangle(
            Phaser.Math.Between(188, 592),
            Phaser.Math.Between(118, 272),
            22,
            22,
            0xff7d9d
          ).setStrokeStyle(2, 0xffd4df);
          this.physics.add.existing(hazard);
          const body = hazard.body as Phaser.Physics.Arcade.Body;
          body.setAllowGravity(false);
          body.setBounce(1, 1);
          body.setCollideWorldBounds(true);
          body.setVelocity(
            Phaser.Math.Between(-110, 110) * (index % 2 === 0 ? 1 : -1),
            Phaser.Math.Between(-110, 110)
          );
          body.setImmovable(false);
          this.physics.add.overlap(this.player, hazard, () => {
            if (this.finished) return;
            this.failRun();
          });
          this.hazards.push(hazard);
        }
      }

      syncHud() {
        this.hudMeta.setText(
          `Рівень ${this.level}/3  •  вузли ${this.collected}/${this.target}  •  час ${this.timeLeft}с  •  нагорода +${game.xp} XP / +${game.coins} монет`
        );
      }

      showOverlay(title: string, body: string, color: number) {
        const titleNode = this.overlay.getByName('title') as Phaser.GameObjects.Text;
        const bodyNode = this.overlay.getByName('body') as Phaser.GameObjects.Text;
        const background = this.overlay.first as Phaser.GameObjects.Rectangle;
        background.setStrokeStyle(2, color, 0.48);
        titleNode.setText(title).setColor(Phaser.Display.Color.IntegerToColor(color).rgba);
        bodyNode.setText(body);
        this.overlay.setVisible(true);
      }

      failRun() {
        this.finished = true;
        this.timerEvent?.remove(false);
        this.playerBody.setVelocity(0, 0);
        this.showOverlay('Спроба зірвалась', 'Натисни R або кнопку перезапуску внизу, щоб пройти маршрут ще раз.', 0xff7d9d);
      }

      winRun() {
        this.finished = true;
        this.timerEvent?.remove(false);
        this.playerBody.setVelocity(0, 0);
        this.showOverlay('Успіх', `Забіг завершено. Ти отримуєш +${game.xp} XP і +${game.coins} монет.`, 0x77d1a8);

        if (!rewardSent) {
          rewardSent = true;
          onComplete({ xp: game.xp, coins: game.coins });
        }
      }

      update() {
        if (!this.playerBody) return;

        if (this.wasd?.R?.isDown && this.finished) {
          rewardSent = false;
          this.startLevel(1);
          return;
        }

        if (this.finished) return;

        const left = this.cursors.left?.isDown || this.wasd?.A?.isDown;
        const right = this.cursors.right?.isDown || this.wasd?.D?.isDown;
        const up = this.cursors.up?.isDown || this.wasd?.W?.isDown;
        const down = this.cursors.down?.isDown || this.wasd?.S?.isDown;

        const speed = 180;
        this.playerBody.setAcceleration(0, 0);

        if (left) this.playerBody.setAccelerationX(-speed * 10);
        if (right) this.playerBody.setAccelerationX(speed * 10);
        if (up) this.playerBody.setAccelerationY(-speed * 10);
        if (down) this.playerBody.setAccelerationY(speed * 10);
      }
    }

    const gameInstance = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: 640,
      height: 360,
      backgroundColor: 'transparent',
      transparent: true,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      },
      scene: SkillRunScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });

    return () => {
      gameInstance.destroy(true);
    };
  }, [game, onComplete, sessionKey]);

  return <div className="phaser-preview" ref={hostRef} aria-label="Ігрова сцена Phaser" />;
}
