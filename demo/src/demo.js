document.addEventListener('DOMContentLoaded', () => {
  const focusableElements = Array.from(document.querySelectorAll('.focusable[tabindex="0"]'));
  let currentFocusIndex = -1;

  function setInitialFocus() {
    if (focusableElements.length > 0) {
      const firstVisibleElement = focusableElements.find((el) => el.offsetParent !== null);
      if (firstVisibleElement) {
        firstVisibleElement.focus();
        currentFocusIndex = focusableElements.indexOf(firstVisibleElement);
      } else if (focusableElements[0]) {
        focusableElements[0].focus();
        currentFocusIndex = 0;
      }
    }
  }

  setInitialFocus();

  function getRect(element) {
    return element.getBoundingClientRect();
  }

  function getCenter(rect) {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  /**
   * Checks if the point (x, y) is inside the rectangle rect.
   * @param {number} x - X coordinate of the point.
   * @param {number} y - Y coordinate of the point.
   * @param {DOMRect} rect - Rectangle to check.
   * @returns {boolean} - True if the point is inside the rectangle.
   */
  function isPointInRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  /**
   * Calculates the projection of the center of one rectangle onto the axis of another in the given direction.
   * Used to more accurately determine "opposite".
   * @param {DOMRect} currentRect - Current rectangle.
   * @param {DOMRect} candidateRect - Candidate rectangle.
   * @param {string} direction - Direction ('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight').
   * @returns {number} - Coordinate of the projection on the perpendicular axis.
   */
  function getProjection(currentRect, candidateRect, direction) {
    const currentCenter = getCenter(currentRect);
    const candidateCenter = getCenter(candidateRect);

    switch (direction) {
      case 'ArrowUp':
      case 'ArrowDown':
        // Project the candidate's center on the current horizontal line
        // If the centers are significantly offset, use the nearest edge
        if (candidateCenter.x < currentRect.left) return currentRect.left;
        if (candidateCenter.x > currentRect.right) return currentRect.right;
        return candidateCenter.x; // The projection coincides with the X coordinate of the candidate's center
      case 'ArrowLeft':
      case 'ArrowRight':
        // Project the candidate's center on the current vertical line
        if (candidateCenter.y < currentRect.top) return currentRect.top;
        if (candidateCenter.y > currentRect.bottom) return currentRect.bottom;
        return candidateCenter.y; // The projection coincides with the Y coordinate of the candidate's center
      default:
        return 0;
    }
  }

  // Function to find the best candidate for focus in the given direction
  function findNextFocusable(currentElement, direction) {
    if (!currentElement) return null;

    const currentRect = getRect(currentElement);
    const currentCenter = getCenter(currentRect);

    let bestCandidate = null;
    let minDistance = Infinity;

    // Iterate through all *other* focusable elements that are visible
    const visibleFocusableElements = focusableElements.filter(
      (el) => el !== currentElement && el.offsetParent !== null
    );

    visibleFocusableElements.forEach((candidate) => {
      const candidateRect = getRect(candidate);
      const candidateCenter = getCenter(candidateRect);

      // Calculate the difference in center coordinates
      const dx = candidateCenter.x - currentCenter.x;
      const dy = candidateCenter.y - currentCenter.y;

      let isSuitable = false;
      let distance = Infinity;

      // Main logic for checking direction
      switch (direction) {
        case 'ArrowUp':
          if (dy < 0) {
            // Candidate should be above
            // Check horizontal overlap
            if (candidateRect.right > currentRect.left && candidateRect.left < currentRect.right) {
              isSuitable = true;
              // Distance: priority to vertical shift, then horizontal
              distance = Math.abs(dy) + Math.abs(dx) * 0.3;
              // Additional bonus if the centers are almost on the same vertical line
              if (Math.abs(dx) < Math.min(currentRect.width, candidateRect.width) / 4) {
                distance *= 0.8; // Reduce the "cost"
              }
            }
          }
          break;
        case 'ArrowDown':
          if (dy > 0) {
            // Candidate should be below
            if (candidateRect.right > currentRect.left && candidateRect.left < currentRect.right) {
              isSuitable = true;
              distance = Math.abs(dy) + Math.abs(dx) * 0.3;
              if (Math.abs(dx) < Math.min(currentRect.width, candidateRect.width) / 4) {
                distance *= 0.8;
              }
            }
          }
          break;
        case 'ArrowLeft':
          if (dx < 0) {
            // Candidate should be left
            // Check vertical overlap
            if (candidateRect.bottom > currentRect.top && candidateRect.top < currentRect.bottom) {
              isSuitable = true;
              // Distance: priority to horizontal shift, then vertical
              distance = Math.abs(dx) + Math.abs(dy) * 0.3;
              // Additional bonus if the centers are almost on the same horizontal line
              if (Math.abs(dy) < Math.min(currentRect.height, candidateRect.height) / 4) {
                distance *= 0.8;
              }
            }
          }
          break;
        case 'ArrowRight':
          if (dx > 0) {
            // Candidate should be right
            if (candidateRect.bottom > currentRect.top && candidateRect.top < currentRect.bottom) {
              isSuitable = true;
              distance = Math.abs(dx) + Math.abs(dy) * 0.3;
              if (Math.abs(dy) < Math.min(currentRect.height, candidateRect.height) / 4) {
                distance *= 0.8;
              }
            }
          }
          break;
      }

      // Improved check: Make sure the candidate is not completely "behind" the current element
      // For example, when moving right, the candidate should not be completely above or below
      if (isSuitable) {
        const projectionPoint = getProjection(currentRect, candidateRect, direction);
        let checkPointX = currentCenter.x,
          checkPointY = currentCenter.y;

        // Move the check point slightly in the direction of movement
        const offset = 1;
        if (direction === 'ArrowUp') checkPointY -= offset;
        else if (direction === 'ArrowDown') checkPointY += offset;
        else if (direction === 'ArrowLeft') checkPointX -= offset;
        else if (direction === 'ArrowRight') checkPointX += offset;

        // If the projection of the candidate's center on the current element's axis falls inside the candidate,
        // then this is a good sign.
        let projectionOnCandidateAxis;
        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
          projectionOnCandidateAxis =
            projectionPoint >= candidateRect.left && projectionPoint <= candidateRect.right;
        } else {
          // Left, Right
          projectionOnCandidateAxis =
            projectionPoint >= candidateRect.top && projectionPoint <= candidateRect.bottom;
        }

        if (!projectionOnCandidateAxis) {
          // If the projection does not fall, the candidate may be too far.
          // Increase the "cost" of moving to it.
          distance *= 1.5;
        }

        // Additional check: if the candidate is strictly diagonal
        // and there are other candidates strictly horizontal/vertical,
        // it may not be worth going diagonal.
        // (This logic can be added if the current one seems insufficiently accurate)
      }

      // Update the best candidate if a better one is found
      if (isSuitable && distance < minDistance) {
        minDistance = distance;
        bestCandidate = candidate;
      }
    });

    return bestCandidate; // Return the best found element
  }

  // Keydown handler
  document.addEventListener('keydown', (event) => {
    const currentFocusedElement = document.activeElement;

    if (!currentFocusedElement || !focusableElements.includes(currentFocusedElement)) {
      if (
        currentFocusIndex !== -1 &&
        focusableElements[currentFocusIndex] &&
        focusableElements[currentFocusIndex].offsetParent !== null
      ) {
        focusableElements[currentFocusIndex].focus();
      } else {
        setInitialFocus();
      }
      // If the focus is not on the controllable element, exit (or try to return)
      // It is important not to interrupt if the focus is on the body or another non-controllable element,
      // so that navigation can start from the first element.
      // Therefore, I removed return here.
    }

    const direction = event.key;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(direction)) {
      event.preventDefault(); // Prevent default scrolling behavior

      // If the focus was lost, try to start from the first visible element
      const startElement =
        currentFocusedElement && focusableElements.includes(currentFocusedElement)
          ? currentFocusedElement
          : focusableElements.find((el) => el.offsetParent !== null);

      if (!startElement) return; // No visible elements for navigation

      const nextElement = findNextFocusable(startElement, direction);

      if (nextElement) {
        nextElement.focus();
        currentFocusIndex = focusableElements.indexOf(nextElement);
      }
    }

    if (event.key === 'Enter') {
      if (currentFocusedElement && focusableElements.includes(currentFocusedElement)) {
        console.log('Enter pressed on element:', currentFocusedElement.textContent);
        // You can add a visual effect of pressing
        currentFocusedElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
          // Return the original focus scale
          if (document.activeElement === currentFocusedElement) {
            // Check that the focus has not moved
            currentFocusedElement.style.transform = 'scale(1.05)';
          } else {
            currentFocusedElement.style.transform = 'scale(1)'; // If the focus has moved, just reset
          }
        }, 100);
      }
    }
  });

  // Add focus handler to update currentFocusIndex
  focusableElements.forEach((el, index) => {
    el.addEventListener('focus', () => {
      currentFocusIndex = index;
    });
  });

  // Handler for window resize for possible adaptation (although the main logic is already adaptive)
  // window.addEventListener('resize', () => {
  //     console.log("Window resized, focus logic should adapt automatically.");
  // You can add recalculation of something if necessary, but getBoundingClientRect() always gives up-to-date data
  // });
});
