import Aux from '../SlotEnum';

//TESTE IGOR
const { ccclass, property } = cc._decorator;

@ccclass
export default class Machine extends cc.Component {
  @property(cc.Node)
  public button: cc.Node = null;

  @property(cc.Prefab)
  public _reelPrefab = null;

  @property({ type: cc.Prefab })
  get reelPrefab(): cc.Prefab {
    return this._reelPrefab;
  }

  set reelPrefab(newPrefab: cc.Prefab) {
    this._reelPrefab = newPrefab;
    this.node.removeAllChildren();

    if (newPrefab !== null) {
      this.createMachine();
    }
  }

  @property({ type: cc.Integer })
  public _numberOfReels = 3;

  @property({ type: cc.Integer, range: [3, 6], slide: true })
  get numberOfReels(): number {
    return this._numberOfReels;
  }

  set numberOfReels(newNumber: number) {
    this._numberOfReels = newNumber;

    if (this.reelPrefab !== null) {
      this.createMachine();
    }
  }

  private reels = [];

  public spinning = false;

  createMachine(): void {
    this.node.destroyAllChildren();
    this.reels = [];

    let newReel: cc.Node;
    for (let i = 0; i < this.numberOfReels; i += 1) {
      newReel = cc.instantiate(this.reelPrefab);
      this.node.addChild(newReel);
      this.reels[i] = newReel;

      const reelScript = newReel.getComponent('Reel');
      reelScript.shuffle();
      reelScript.reelAnchor.getComponent(cc.Layout).enabled = false;
    }

    this.node.getComponent(cc.Widget).updateAlignment();
  }

  spin(): void {
    this.spinning = true;
    this.button.getChildByName('Label').getComponent(cc.Label).string = 'STOP';

    for (let i = 0; i < this.numberOfReels; i += 1) {
      const theReel = this.reels[i].getComponent('Reel');
      
      for(let w = 0; w < this.reels[i].getComponent('Reel').getTilesLenght(); w++){ //Para de piscar os tiles quando rodar de novo.
        this.reels[i].getComponent('Reel').tiles[w].getComponent('Tile').stopGlow();
      }
      
      if (i % 2) {
        theReel.spinDirection = Aux.Direction.Down;
      } else {
        theReel.spinDirection = Aux.Direction.Up;
      }

      theReel.doSpin(0.03 * i);
    }
  }

  lock(): void {
    this.button.getComponent(cc.Button).interactable = false;
  }

  stop(result: Array<Array<number>> = null): void {
    setTimeout(() => {
      this.spinning = false;
      this.button.getComponent(cc.Button).interactable = true;
      this.button.getChildByName('Label').getComponent(cc.Label).string = 'SPIN';
    }, 2500);

    const rngMod = Math.random() / 2;
    for (let i = 0; i < this.numberOfReels; i += 1) {
      const spinDelay = i < 2 + rngMod ? i / 4 : rngMod * (i - 2) + i / 4;
      const theReel = this.reels[i].getComponent('Reel');

      setTimeout(() => {
        theReel.readyStop(result[i]);
      }, spinDelay * 1000);
    }
  }

  pattern(){ //Cria o pattern de tiles em porcentagem
    const percent = Math.floor(Math.random()*100); //Para randomizar a porcentagem
    const textureChosen = Math.floor(Math.random()*this.reels[0].getComponent('Reel').getTextureLenght()); //Randomiza um numero de 0 a quantidade de textura do tile 0 dentro do reel 0
    const listEmpty1 = []; //Lista Vazia para saber qual reel que vai receber a textura
    for(let i=0; i<this.numberOfReels; i ++){
      this.reels[i].getComponent('Reel').getTextureChosen(textureChosen);
    }
    
    if(percent < 7){ // 7%
      for(let i=0; i<5; i++){
        const listEmpty2 = []; //Lista Vazia para saber em qual tile vai a textura
        for(let w=0; w<5; w++){         
           listEmpty2.push(textureChosen);                                
        }
        listEmpty1.push(listEmpty2);
      }
      return listEmpty1;

    }else if(percent >= 7 && percent < 17){ // 10%
      let lineRandom1 = Math.floor(Math.random()*3); //Cria um random de 0 a 3 pra pegar as linhas
      let lineRandom2 = Math.floor(Math.random()*3); //Cria um random de 0 a 3 pra pegar as linhas
      lineRandom2 = this.checkEqualLines(lineRandom1, lineRandom2);      
      return this.checkLine(lineRandom1, lineRandom2, textureChosen);
      
    }else if(percent >=17 && percent <50){ // 33%

      let linhaRandom = Math.floor(Math.random()*3); //Cria um random de 0 a 3 pra pegar as linhas
      return this.checkLine(linhaRandom, null, textureChosen);

    }else if(percent >= 50){ //50%  
      return [];
    }
  }

  checkLine(lineRandom1, lineRandom2 = null, textureChosen){ //Checa as linhas escolhidas e coloca os tiles certos no lugar certo.
    const listEmpty1 = [];
    let line1;
    let line2;
      for(let i=0; i<5; i++){
        const listEmpty2 = [];
        for(let w=0; w<5; w++){
          if(i % 2){
            line1 = lineRandom1 +2;
            if(lineRandom2 != null){
              line2 = lineRandom2 +2;
            }
          }else{
            line1 = lineRandom1;
            line2 = lineRandom2;
          }
          if(w == line1 || w == line2){
            listEmpty2.push(textureChosen); 
          }else{
            let TextureRandom = Math.floor(Math.random()*this.reels[0].getComponent('Reel').getTextureLenght());
            if((TextureRandom == textureChosen) && (textureChosen <= 0)){ //Certifica que a textura aleatoria não é a mesma da escolhida, para não ter problema de acontecer outra linha fechada pela "sorte".
              TextureRandom +=1;
            }else if(TextureRandom == textureChosen){
              TextureRandom -=1;
            }
            listEmpty2.push(TextureRandom);  
          }                                       
        }
        listEmpty1.push(listEmpty2);
      }
      return listEmpty1;
  }

  checkEqualLines(lineRandom1, lineRandom2){ //Checa se as duas linhas que foram escolhidas não são iguais, e altera o valor da segunda linha.
    if((lineRandom2 == lineRandom1) && lineRandom1>=2){
      lineRandom2 = Math.floor(Math.random()*2);
    }else if((lineRandom2 == lineRandom1) && lineRandom1<=0){
      lineRandom2 = Math.floor(Math.random()*2);
      lineRandom2 +=1;
    }else if((lineRandom2 == lineRandom1) && lineRandom1 == 1){
      let randomMid = Math.floor(Math.random()*100); //Randomiza 50% para ir para linha de cima ou de baixo caso a primeira linha escolhida for a do meio e a segunda também.
      if(randomMid >= 50){
        lineRandom2 -=1;
      } else{
        lineRandom2 += 1;
      }
    }    
    return lineRandom2;
  }
}
