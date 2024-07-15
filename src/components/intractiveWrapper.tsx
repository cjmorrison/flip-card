import React from "react";
import "./interactive.scss";
import deepcopy from "deepcopy";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Fab from "@mui/material/Fab";
import CardActions from "@mui/material/CardActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface CardData {
  frontImgSrc?: string;
  frontImgAltText?: string;
  frontText: string;
  backImgSrc?: string;
  backImgAltText?: string;
  backText: string;
  isFlipped: Boolean;
}

interface CardsData {
  interactiveTitle?: string;
  intructions?: string;
  cardWidth: number;
  cardPxHeight?: number,
  cards: Array<CardData>;
}
interface PropType {
  src?: string;
}
interface StateType {
  langData: object;
  cardsData: CardsData;
}

class IntractiveWrapper extends React.Component<PropType, StateType> {
  ref: any = null;
  usingDataSrc: string = "";
  supportedLangs: Array<string> = ["en", "fr-ca"];
  defaultLang: string = "en";
  langSelection: string = this.defaultLang;
  stepperSteps: Array<{ label: string; description: string }> = [];
  correctResponce: boolean = false;
  score: number = 0;

  state = {
    langData: {},
    cardsData: {
      interactiveTitle: "Data Load Failure",
      intructions: "",
      cardWidth: 6,
      cardPxHeight: 300,
      cards: [
        {
          frontText: "Failed To Load Data",
          backText: "opps",
          isFlipped: false,
        },
      ],
    },
  };

  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount = () => {
    //this.getLangData();
    console.log("MpsPlayer ready");

    if ((window as any).fc_srcOverride) {
      this.usingDataSrc = (window as any).fc_srcOverride as string;
    }
    // if ((window as any).parent && (window as any).parent.fc_srcOverride) {
    // this.usingDataSrc = (window as any).parent.fc_srcOverride as string;
    // }
    else if (this.props.src) {
      this.usingDataSrc = this.props.src;
    } else {
      this.usingDataSrc = "./sample.json";
    }

    this.getCardsData().then(() => {
      //this.shuffleAnswerData().then();
    });
  };

  getLangData = () => {
    return new Promise((resolve, reject) => {
      if ((window as any).fc_langOverride) {
        if (
          this.supportedLangs.indexOf((window as any).fc_langOverride) === -1
        ) {
          this.langSelection = (window as any).fc_srcOverride as string;
        } else {
          console.warn(
            `provided lang overide ${
              (window as any).fc_srcOverride
            } is not availible`
          );
        }
      }

      fetch(`./lang/${this.langSelection}.json`)
        .then((response) => response.json())
        .then((publicLangData: object) => {
          this.setState(
            {
              langData: publicLangData,
            },
            () => {
              resolve(this.state.langData);
            }
          );
        });
    });
  };

  getCardsData = () => {
    return new Promise((resolve, reject) => {
      fetch(this.usingDataSrc)
        .then((response) => response.json())
        .then((publicCardsData: CardsData) => {
          this.setState(
            {
              cardsData: publicCardsData,
            },
            () => {
              resolve(this.state.cardsData);
            }
          );
        });
    });
  };

  langKey = (key: string) => {
    return this.state.langData[key] as string;
  };

  handleCardFlip = (cardIndex: number) => {
    const cardsCopy = deepcopy(this.state.cardsData);
    cardsCopy.cards[cardIndex].isFlipped =
      !cardsCopy.cards[cardIndex].isFlipped;
    this.setState({ cardsData: cardsCopy });
  };

  render() {
    const buildHeader = () => {
      if (this.state.cardsData.interactiveTitle) {
        return (
          <h2 className="fc_header">{this.state.cardsData.interactiveTitle}</h2>
        );
      } else {
        return "";
      }
    };

    const buildInsturction = () => {
      if (this.state.cardsData.interactiveTitle) {
        return (
          <Box
            className="instructionText"
            dangerouslySetInnerHTML={{
              __html: this.state.cardsData.intructions,
            }}
          ></Box>
        );
      } else {
        return (
          <Box className="instructionText">
            <p>
              <strong> Instructions: </strong> Select the most correct answer,
              then select the Select Answer button.
            </p>
          </Box>
        );
      }
    };

    const buildCard = (cardDat: CardData, cardIndex: number) => {
      const buildMedia = (isBack?: boolean) => {
        if (isBack) {
          if (cardDat.backImgSrc) {
            return (
              <CardMedia
                className="media"
                image={cardDat.backImgSrc}
                title={cardDat.backImgAltText}
              />
            );
          } else {
            return "";
          }
        }
        if (cardDat.frontImgSrc) {
          return (
            <CardMedia
              className="media"
              image={cardDat.frontImgSrc}
              title={cardDat.frontImgAltText}
            />
          );
        } else {
          return "";
        }
      };

      return (
        <Grid xs={6} key={`card_${cardIndex}`} className="cardWrapper">
          <div style={{height:(this.state.cardsData.cardPxHeight|0)+'px'}} className={`card ${cardDat.isFlipped ? "flipped" : ""}`}>
            <div className="card-inner">
              <Card className="card-front">
                {buildMedia()}

                <CardContent className="text">
                  <div
                    dangerouslySetInnerHTML={{ __html: cardDat.frontText }}
                  ></div>
                </CardContent>
                <CardActions>
                  <Fab
                    color="primary"
                    className="flipCardButton"
                    onClick={() => {
                      this.handleCardFlip(cardIndex);
                    }}
                  >
                    <FontAwesomeIcon icon={faRotateRight as IconProp} />
                    <span className="sr-only">flip card</span>
                  </Fab>
                </CardActions>
              </Card>

              <Card className="card-back">
                {buildMedia(true)}

                <CardContent className="text">{cardDat.backText}</CardContent>
                <CardActions>
                  <Fab
                    color="primary"
                    className="flipCardButton"
                    onClick={() => {
                      this.handleCardFlip(cardIndex);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faRotateRight as IconProp}
                      flip="both"
                    />
                    <span className="sr-only">flip card</span>
                  </Fab>{" "}
                </CardActions>
              </Card>
            </div>
          </div>
        </Grid>
      );
    };

    const buildCards = () => {
      const cardsItems = this.state.cardsData.cards.map(
        (crd: CardData, idx: number) => {
          return buildCard(crd, idx);
        }
      );
      return cardsItems;
    };

    return (
      <Box className="fcInteractive">
        {buildHeader()}
        {buildInsturction()}

        <Box className="fc_cardsDisplay" sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            {buildCards()}
          </Grid>
        </Box>
      </Box>
    );
  }
}

export default IntractiveWrapper;
