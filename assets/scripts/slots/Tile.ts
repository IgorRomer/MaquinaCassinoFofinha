const { ccclass, property } = cc._decorator;

/*
    Teste do Igor.
*/

@ccclass
export default class Tile extends cc.Component {
  @property({ type: [cc.SpriteFrame], visible: true })
  private textures = [];

  async onLoad(): Promise<void> {
    await this.loadTextures();
  }

  async resetInEditor(): Promise<void> {
    await this.loadTextures();
    this.setRandom();
  }

  async loadTextures(): Promise<boolean> {
    const self = this;
    return new Promise<boolean>(resolve => {
      cc.loader.loadResDir('gfx/Square', cc.SpriteFrame, function afterLoad(err, loadedTextures) {
        self.textures = loadedTextures;
        resolve(true);
      });
    });
  }

  setTile(index: number): void {
    this.node.getComponent(cc.Sprite).spriteFrame = this.textures[index];
  }

  setRandom(): void {
    const randomIndex = Math.floor(Math.random() * this.textures.length);
    this.setTile(randomIndex);
  }

  getTextureLenght(){ //Pega a quantidade de textura desse Tile.
    return this.textures.length;
  }

  startGlow(){ //Ativa o glow filho do objeto.
    var glow = this.node.getChildByName("glow");
    glow.active = true;

  }
  stopGlow(): void{ //Desativa o glow filho do objeto.
    var glow = this.node.getChildByName("glow");
    glow.active = false;
  }
}
