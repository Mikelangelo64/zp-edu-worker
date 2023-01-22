document.addEventListener('DOMContentLoaded', function () {
  const isSafari = () => {
    return (
      ~navigator.userAgent.indexOf('Safari') &&
      navigator.userAgent.indexOf('Chrome') < 0
    );
  };

  const isMobile = {
    Android: function () {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
      return navigator.userAgent.match(/Opera mini/i);
    },
    Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
      return (
        isMobile.Android() ||
        isMobile.BlackBerry() ||
        isMobile.iOS() ||
        isMobile.Opera() ||
        isMobile.Windows()
      );
    },
  };

  if (isMobile.any()) {
    document.querySelector('body').classList.add('v-mobile');
    document.querySelector('html').classList.add('v-mobile');
  } else {
    document.querySelector('body').classList.add('v-desk');
    document.querySelector('html').classList.add('v-desk');
  }

  //normal vh
  const vh = window.innerHeight * 0.01;
  document.body.style.setProperty('--vh', `${vh}px`);

  //change header when scroll
  const header = document.querySelector('.header');
  let isFatHeader = true;

  header &&
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100 && isFatHeader) {
        console.log(1);
        header.classList.add('_scrolled');
        isFatHeader = false;
        return;
      }

      if (window.scrollY <= 100 && !isFatHeader) {
        header.classList.remove('_scrolled');
        isFatHeader = true;
        return;
      }
    });

  //header big height
  let headerBigHeight = header ? header.getBoundingClientRect().height : 200;
  document.body.style.setProperty('--header-big', `${headerBigHeight}px`);

  window.addEventListener('resize', () => {
    headerBigHeight = header ? header.getBoundingClientRect().height : 200;
    document.body.style.setProperty('--header-big', `${headerBigHeight}px`);
  });

  //search popup
  const searchButton = document.body.querySelector('.header__btn__search');
  const searchPopup = document.body.querySelector('.popup-search');
  const searchCloseButton =
    searchPopup && searchPopup.querySelector('.popup-search__close');

  const openSearchPopup = () => {
    if (!searchPopup) {
      return;
    }
    searchPopup.classList.toggle('_opened');
  };

  const closeSearchPopup = () => {
    searchPopup.classList.remove('_opened');
  };

  searchButton &&
    searchPopup &&
    searchButton.addEventListener('click', openSearchPopup);
  searchCloseButton &&
    searchPopup &&
    searchCloseButton.addEventListener('click', closeSearchPopup);

  //popup
  const makeTimelinePopup = (item) => {
    const popupInner = item.querySelector('.popup__scroll');
    if (!popupInner) {
      return;
    }

    const timelinePopup = gsap.timeline({
      defaults: { duration: 0.3, ease: 'power4.inOut' },
    });
    timelinePopup
      .to(item, { display: 'block', duration: 0.01 })
      .from(item, { opacity: 0 })
      .to(item, { opacity: 1 })
      .to(popupInner, { x: 0 });

    return timelinePopup;
  };

  const popupAnimations = {};
  const popups = document.querySelectorAll('.popup');

  if (Array.from(popups).length !== 0) {
    Array.from(popups).forEach((popup) => {
      const timeline = makeTimelinePopup(popup);
      timeline.pause();
      popupAnimations[popup.dataset.popupname] = timeline;
    });
  }

  //open popup
  const popupOpenBtns = document.querySelectorAll('.popup-open');

  const openPopup = (evt) => {
    const popupClass = evt.target.dataset.popup;
    const popup = document.querySelector(`.${popupClass}`);

    popupAnimations[popupClass].play();

    popup.classList.add('_opened');
    document.querySelector('html').classList.add('_lock');
    document.querySelector('body').classList.add('_lock');
  };

  if (popupOpenBtns) {
    Array.from(popupOpenBtns).forEach((item) => {
      item.addEventListener('click', (evt) => {
        evt.preventDefault();
        openPopup(evt);
      });
    });
  }

  //close popup
  const popupCloseBtns = document.querySelectorAll('.popup__close');
  const popupArr = document.querySelectorAll('.popup');

  const closePopup = (popup) => {
    popup.classList.remove('_opened');
    const popupClass = popup.dataset.popupname;
    //console.dir(popup);
    popupAnimations[popupClass].reverse();

    document.querySelector('html').classList.remove('_lock');
    document.querySelector('body').classList.remove('_lock');
  };

  if (popupCloseBtns) {
    Array.from(popupCloseBtns).forEach((item) => {
      item.addEventListener('click', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        const popup = this.parentElement.parentElement.parentElement;
        closePopup(popup);
      });
    });
  }

  if (popupArr) {
    Array.from(popupArr).forEach((item) => {
      item.addEventListener('click', function (evt) {
        if (evt.target === this) {
          closePopup(this);
        }
      });
    });

    window.addEventListener('keydown', function (evt) {
      if (evt.keyCode === 27) {
        const popup = document.querySelector('.popup._opened');
        if (popup) {
          closePopup(popup);
        }
      }
    });
  }

  //DEPARTMENT infinity scroll
  const marqueeTimelines = [];
  const departmentListArr = Array.from(
    document.querySelectorAll('[data-list="marquee"]')
  );

  // const globalTimeline = gsap.timeline();
  // //globalTimeline.pause()
  // const departmentList = document.querySelector('[data-list="marquee"]');

  // const departmentListContent =
  //   departmentList && departmentList.firstElementChild;

  // let originalChild =
  //   departmentListContent && departmentListContent.cloneNode(true);
  let isTimelineDeath = false;

  //Make one clone of content
  const makeClone = (content, parent) => {
    if (!content && !parent) {
      return;
    }

    const cloneContent = content.cloneNode(true);
    //const cloneContent = parent.innerHTML;
    parent.append(cloneContent);
    //parent.insertBefore(cloneContent, parent.firstElementChild);
  };

  //get width and gap of list content
  const getWidthWithGap = (item) => {
    if (!item) {
      return null;
    }

    const itemWidth = item.getBoundingClientRect().width;

    const lastChild = item.lastElementChild;
    const gap = getComputedStyle(lastChild).getPropertyValue('margin-left');

    const result = +itemWidth + parseInt(gap, 10);
    //console.log(itemWidth, gap);
    return result;
  };

  //if in list have too few elements add class "_small"
  const isSmallMarque = (marque, content) => {
    if (!marque && !content) {
      return;
    }
    const contentWidth = content.getBoundingClientRect().width;
    const windowWidth = document.body.clientWidth;

    console.log(contentWidth, windowWidth);
    return contentWidth / windowWidth < 1;
  };

  //make Timeline for list of content
  const makeMarqueeTimeline = (
    item,
    //isReverseSmall = false,
    isReverse = false
  ) => {
    const timeline = gsap.timeline();
    //const translateX = isReverseSmall ? 50 : 100;
    const shift = isReverse ? -getWidthWithGap(item) : getWidthWithGap(item);

    !isReverse &&
      timeline.set(item, {
        translate: `-${100}% 0`,
      });

    timeline.fromTo(
      item,
      { x: 0 },
      {
        x: shift,
        duration: 30,
        ease: 'none',
        repeat: -1,
      }
    );

    return timeline;
  };

  const initMoveMarquee = (marquee, globalTimeline, marqueIndex) => {
    //console.log(globalTimeline);
    isTimelineDeath = false;
    let progress = globalTimeline ? globalTimeline.progress() : 0;
    globalTimeline && globalTimeline.kill();

    const items = marquee.querySelectorAll('.department-list__inner');

    if (items.length === 0) {
      return;
    }

    items.forEach((item, index) => {
      if (isSmallMarque(marquee, item) && index === 0) {
        marquee.classList.add('_small');
      }

      const timeline = makeMarqueeTimeline(item, marqueIndex % 2 == 0);
      globalTimeline.add(timeline, '0s');
      globalTimeline.progress(progress);
    });
  };

  //change marquee on resize window
  const marqueeResize = (
    departmentList,
    departmentListContent,
    globalTimeline,
    index,
    lastIndex,
    originalChild
  ) => {
    // if (document.body.clientWidth <= 550) {
    //   globalTimeline.kill();

    //   if (!isTimelineDeath) {
    //     departmentList.innerHTML = '';
    //     originalChild.style = '';
    //     departmentList.append(originalChild);

    //     if (lastIndex) {
    //       isTimelineDeath = true;
    //     }
    //   }
    //   return;
    // }

    // if (departmentList.children.length === 1) {
    //   makeClone(departmentListContent, departmentList);
    // }
    initMoveMarquee(departmentList, globalTimeline, index);
  };

  if (departmentListArr.length !== 0) {
    departmentListArr.forEach((departmentList, index, arr) => {
      const globalTimeline = gsap.timeline();
      marqueeTimelines.push(globalTimeline);
      //globalTimeline.pause()
      const departmentListContent =
        departmentList && departmentList.firstElementChild;

      let originalChild =
        departmentListContent && departmentListContent.cloneNode(true);

      //if (document.body.clientWidth > 550) {
      makeClone(departmentListContent, departmentList);
      initMoveMarquee(departmentList, globalTimeline, index);

      if (!isMobile.any()) {
        departmentList.addEventListener('mouseenter', () => {
          globalTimeline.pause();
        });

        departmentList.addEventListener('mouseleave', () => {
          globalTimeline.play();
        });
      }
      //} else {
      if (isSmallMarque(departmentList, departmentListContent)) {
        departmentList.classList.add('_small');
      }
      //}

      window.addEventListener('resize', () => {
        marqueeResize(
          departmentList,
          departmentListContent,
          globalTimeline,
          index,
          index === arr.length - 1,
          originalChild
        );
      });
    });
  }

  // if (document.body.clientWidth > 550) {
  //   makeClone(departmentListContent, departmentList);
  //   initMoveMarquee(departmentList);
  // }

  //globalTimeline.pause();

  // departmentList.addEventListener('mouseenter', () => {
  //   globalTimeline.pause();
  // });

  // departmentList.addEventListener('mouseleave', () => {
  //   globalTimeline.play();
  // });

  //makeMoreClone
  // function makeMoreClone(itemWidth, windowWidth) {
  //   if (itemWidth / windowWidth >= 1) {
  //     return;
  //   }

  //   if (itemWidth / windowWidth < 1) {
  //     cloneCount++;
  //     makeMoreClone(itemWidth * 2, windowWidth);
  //   }
  // }

  // //create timeline
  // const makeTimelineScroll = (item, shift) => {
  //   const timeline = gsap.timeline({ repeat: -1 });

  //   timeline.to(item, {
  //     duration: 10,
  //     x: `${shift * 100 + 100}%`,
  //     ease: 'none',
  //     // modifiers: {
  //     //   x: gsap.utils.unitize((x) => parseFloat(x) % (shift * 100 )), //force x value to be between 0 and 500 using modulus
  //     // },
  //   });

  //   return timeline;
  // };

  // //add clone in html
  // const addClone = (item) => {
  //   const itemWidth = item.getBoundingClientRect().width;
  //   const windowWidth = document.body.clientWidth;

  //   //const innerContent = item.querySelector('.department-list__inner');
  //   const innerContent = item.innerHTML;

  //   if (!innerContent) {
  //     return;
  //   }

  //   makeMoreClone(itemWidth, windowWidth);

  //   for (let i = 0; i < cloneCount; i++) {
  //     item.insertAdjacentHTML('beforeend', innerContent);
  //   }
  // };

  // //initialize scroll for one line
  // const initScroll = (item) => {
  //   addClone(item);
  //   const inners = item.querySelectorAll('.department-list__inner');

  //   if (inners.length === 0) {
  //     return;
  //   }

  //   inners.forEach((inner, index) => {
  //     const innerLeft = inner.getBoundingClientRect().left;
  //     const innerWidth = inner.getBoundingClientRect().width;
  //     const windowWidth = document.body.clientWidth;

  //     const shift = innerWidth / windowWidth;

  //     console.log(shift);

  //     globalTimeline.add(makeTimelineScroll(inner, shift), '0s');
  //   });
  //   // const itemWidth = item.getBoundingClientRect().width;
  //   // const windowWidth = document.body.clientWidth;

  //   // const shift = windowWidth / (itemWidth * (cloneCount + 1));

  //   // console.log(shift);

  //   // makeTimelineScroll(item, shift);
  // };

  //departmentList && initScroll(departmentList);

  // let loop = horizontalLoop(departmentList, {
  //   speed: 1,
  //   repeat: -1,
  //   paddingRight: 25,
  // });

  // function horizontalLoop(items, config) {
  //   items = gsap.utils.toArray(items);
  //   config = config || {};
  //   let tl = gsap.timeline({
  //       repeat: config.repeat,
  //       paused: config.paused,
  //       defaults: { ease: 'none' },
  //       onReverseComplete: () =>
  //         tl.totalTime(tl.rawTime() + tl.duration() * 100),
  //     }),
  //     length = items.length,
  //     startX = items[0].offsetLeft,
  //     times = [],
  //     widths = [],
  //     xPercents = [],
  //     curIndex = 0,
  //     pixelsPerSecond = (config.speed || 1) * 100,
  //     snap =
  //       config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
  //     totalWidth,
  //     curX,
  //     distanceToStart,
  //     distanceToLoop,
  //     item,
  //     i;
  //   gsap.set(items, {
  //     // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
  //     xPercent: (i, el) => {
  //       let w = (widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px')));
  //       xPercents[i] = snap(
  //         (parseFloat(gsap.getProperty(el, 'x', 'px')) / w) * 100 +
  //           gsap.getProperty(el, 'xPercent')
  //       );
  //       return xPercents[i];
  //     },
  //   });
  //   gsap.set(items, { x: 0 });
  //   totalWidth =
  //     items[length - 1].offsetLeft +
  //     (xPercents[length - 1] / 100) * widths[length - 1] -
  //     startX +
  //     items[length - 1].offsetWidth *
  //       gsap.getProperty(items[length - 1], 'scaleX') +
  //     (parseFloat(config.paddingRight) || 0);
  //   for (i = 0; i < length; i++) {
  //     item = items[i];
  //     curX = (xPercents[i] / 100) * widths[i];
  //     distanceToStart = item.offsetLeft + curX - startX;
  //     distanceToLoop =
  //       distanceToStart + widths[i] * gsap.getProperty(item, 'scaleX');
  //     tl.to(
  //       item,
  //       {
  //         xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
  //         duration: distanceToLoop / pixelsPerSecond,
  //       },
  //       0
  //     )
  //       .fromTo(
  //         item,
  //         {
  //           xPercent: snap(
  //             ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
  //           ),
  //         },
  //         {
  //           xPercent: xPercents[i],
  //           duration:
  //             (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
  //           immediateRender: false,
  //         },
  //         distanceToLoop / pixelsPerSecond
  //       )
  //       .add('label' + i, distanceToStart / pixelsPerSecond);
  //     times[i] = distanceToStart / pixelsPerSecond;
  //   }
  //   function toIndex(index, vars) {
  //     vars = vars || {};
  //     Math.abs(index - curIndex) > length / 2 &&
  //       (index += index > curIndex ? -length : length); // always go in the shortest direction
  //     let newIndex = gsap.utils.wrap(0, length, index),
  //       time = times[newIndex];
  //     if (time > tl.time() !== index > curIndex) {
  //       // if we're wrapping the timeline's playhead, make the proper adjustments
  //       vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
  //       time += tl.duration() * (index > curIndex ? 1 : -1);
  //     }
  //     curIndex = newIndex;
  //     vars.overwrite = true;
  //     return tl.tweenTo(time, vars);
  //   }
  //   tl.next = (vars) => toIndex(curIndex + 1, vars);
  //   tl.previous = (vars) => toIndex(curIndex - 1, vars);
  //   tl.current = () => curIndex;
  //   tl.toIndex = (index, vars) => toIndex(index, vars);
  //   tl.times = times;
  //   tl.progress(1, true).progress(0, true); // pre-render for performance
  //   if (config.reversed) {
  //     tl.vars.onReverseComplete();
  //     tl.reverse();
  //   }
  //   return tl;
  // }
});
