$(document).ready(function () {
    function initializeDesktopAccordion() {
        $('.page-section').each(function () {
            var section = $(this);
            var accordionDiv = section.find('[data-sdl-plugin="vertical-accordion"][data-content-source]');

            if (accordionDiv.length > 0) {
                var contentSource = accordionDiv.data('content-source');
                var openSlideAttr = accordionDiv.data('open-slide') || 2; 
                var slidesCount = accordionDiv.data('slides-count') || null; 
                var accordionWrapper = $('<div>', { class: 'accordion__wrapper' });
                accordionDiv.append(accordionWrapper);

                accordionWrapper.css('visibility', 'hidden');

                $.get(contentSource, function (data) {
                    var gridItems = $(data).find('#gridThumbs .grid-item');
                    var panelToExpand = null;
                    var processedItems = 0;
                    var panels = [];
                    var maxHeight = 0;

                    if (slidesCount) {
                        gridItems = gridItems.slice(0, slidesCount);
                    }

                    gridItems.each(function (index) {
                        var gridItem = $(this);
                        var projectUrl = gridItem.attr('href');
                        var portfolioTitle = gridItem.find('.portfolio-title').text();

                        var accordionPanel = $('<div>', { class: 'accordion__panel' });
                        var button = $('<h1>', {class: 'accordion__button-wrapper'}).append($('<button>', {class: 'accordion__button', text: portfolioTitle}).append('<span class="accordion__arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v13m0-13 4 4m-4-4-4 4"/></svg></span>'));


                        var contentWrapper = $('<div>', { class: 'accordion__content-wrapper' });
                        var contentDiv = $('<div>', { class: 'accordion__content' });

                        contentWrapper.append(contentDiv);
                        accordionPanel.append(button);
                        accordionPanel.append(contentWrapper);
                        accordionWrapper.append(accordionPanel);

                        $.get(projectUrl, function (portfolioData) {
                            var articleContent = $(portfolioData).find('#sections');
                            contentDiv.html(articleContent);

                            var hiddenDiv = $('<div>', { style: 'visibility:hidden; position:absolute; top:-9999px;' });
                            hiddenDiv.append(articleContent.clone());
                            $('body').append(hiddenDiv);

                            var calculatedHeight = hiddenDiv.outerHeight(true);
                            hiddenDiv.remove();

                            maxHeight = Math.max(maxHeight, calculatedHeight);

                            contentWrapper.css({
                                'height': calculatedHeight + 'px',
                                'display': 'none'
                            });

                            panels.push({ panel: accordionPanel, height: calculatedHeight });
                            processedItems++;

                            if (processedItems === gridItems.length) {
                                setTimeout(function () {
                                    arrangePanels(panels, accordionWrapper, maxHeight, openSlideAttr, accordionDiv);
                                    bindAccordionClickEvents(accordionWrapper, accordionDiv);
                                    $(window).on('resize', function () {
                                        resizeAccordion(section);
                                    });
                                }, 100);
                            }
                        });
                    });
                });
            }
        });
    }

    function arrangePanels(panels, accordionWrapper, maxHeight, openSlideAttr, accordionDiv) {
        panels.sort(function (a, b) {
            return b.height - a.height;
        });

        var allHeightsSame = panels.every(p => p.height === panels[0].height);
        var panelToExpand;

        if (allHeightsSame) {
            panelToExpand = panels[1].panel;
        } else {
            var targetIndex = openSlideAttr - 1;
            var maxHeightPanel = panels.shift();
            panels.splice(targetIndex, 0, maxHeightPanel);
            panelToExpand = panels[targetIndex].panel;
        }

        panels.forEach(function (item) {
            item.panel.find('.accordion__content-wrapper').css('height', maxHeight + 'px');
        });

        accordionWrapper.empty();
        panels.forEach(function (item) {
            accordionWrapper.append(item.panel);
        });

        if (panelToExpand) {
            panelToExpand.addClass('active');
            var actualPanelContent = panelToExpand.find('.accordion__content-wrapper');
            actualPanelContent.show();
            
            var actualHeight = actualPanelContent.outerHeight(true);
            accordionDiv.css({
                'max-height': '90vh',
                'height': actualHeight + 'px'
            });
            accordionWrapper.css('visibility', 'visible');
        } else {
            accordionWrapper.css('visibility', 'visible');
        }
    }

    function bindAccordionClickEvents(accordionWrapper, accordionDiv) {
        accordionWrapper.find('.accordion__button').off('click').on('click', function () {
            var clickedPanel = $(this).closest('.accordion__panel');
            var isActive = clickedPanel.hasClass('active');

            if (!isActive) {
                accordionWrapper.find('.accordion__panel.active').each(function () {
                    var currentPanel = $(this);
                    currentPanel.removeClass('active');
                    var contentWrapperToHide = currentPanel.find('.accordion__content-wrapper');
                    contentWrapperToHide.hide();
                });

                clickedPanel.addClass('active');
                var contentWrapper = clickedPanel.find('.accordion__content-wrapper');
                contentWrapper.show();  
                var newHeight = contentWrapper.outerHeight(true);
                accordionDiv.animate({ height: newHeight }, 500, 'swing');
            }
        });
    }

    function resizeAccordion(section) {
        var accordionDiv = section.find('[data-sdl-plugin="vertical-accordion"][data-content-source]');
        var accordionWrapper = accordionDiv.find('.accordion__wrapper');
        var panels = accordionWrapper.find('.accordion__panel');

        var maxHeight = 0;
        panels.each(function () {
            var contentWrapper = $(this).find('.accordion__content-wrapper');
            var hiddenDiv = $('<div>', { style: 'visibility:hidden; position:absolute; top:-9999px;' });
            hiddenDiv.append(contentWrapper.find('#sections').clone());
            $('body').append(hiddenDiv);
            var calculatedHeight = hiddenDiv.outerHeight(true);
            hiddenDiv.remove();
            maxHeight = Math.max(maxHeight, calculatedHeight);
            contentWrapper.css('height', calculatedHeight + 'px');
        });

        var activePanel = accordionWrapper.find('.accordion__panel.active');
        if (activePanel.length > 0) {
            var activeContent = activePanel.find('.accordion__content-wrapper');
            var newHeight = activeContent.outerHeight(true);
            accordionDiv.css('height', newHeight + 'px');
        }
    }
  
    function initializeMobileAccordion() {
        $('.page-section').each(function () {
            var section = $(this);
            var accordionDiv = section.find('[data-sdl-plugin="vertical-accordion"][data-content-source]');
            if (accordionDiv.length > 0) {
                var contentSource = accordionDiv.data('content-source');
                var slidesCount = accordionDiv.data('slides-count') || null;
                var openSlide = accordionDiv.data('open-slide') || 1;
                var accordionWrapper = $('<div>', { class: 'accordion__wrapper' });
                accordionDiv.append(accordionWrapper);
                $.get(contentSource, function (data) {
                    var gridItems = $(data).find('#gridThumbs .grid-item');
                    if (slidesCount) {
                        gridItems = gridItems.slice(0, slidesCount);
                    }
                    var panelToExpand = null;
                    gridItems.each(function (index) {
                        var gridItem = $(this);
                        var projectUrl = gridItem.attr('href');
                        var portfolioTitle = gridItem.find('.portfolio-title').text();
                        var accordionPanel = $('<div>', { class: 'accordion__panel' });
                         var button = $('<h1>', {class: 'accordion__button-wrapper'}).append($('<button>', {class: 'accordion__button', text: portfolioTitle}).append('<span class="accordion__arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v13m0-13 4 4m-4-4-4 4"/></svg></span>'));
                        var contentWrapper = $('<div>', { class: 'accordion__content-wrapper' });
                        var contentDiv = $('<div>', { class: 'accordion__content' });
                        contentWrapper.append(contentDiv);
                        accordionPanel.append(button);
                        accordionPanel.append(contentWrapper);
                        accordionWrapper.append(accordionPanel);
                        $.get(projectUrl, function (portfolioData) {
                            var articleContent = $(portfolioData).find('#sections');
                            contentDiv.html(articleContent);
                        });

                        if (index + 1 === openSlide) {
                            panelToExpand = contentWrapper;
                            button.addClass('active');
                            accordionPanel.addClass('active');
                        }

                        button.on('click', function () {
                           if (!contentWrapper.is(':visible')) {
                              accordionWrapper.find('.accordion__panel .accordion__content-wrapper').slideUp();
                            accordionWrapper.find('.accordion__panel').removeClass('active');
                            accordionWrapper.find('.accordion__panel .accordion__button').removeClass('active');
                            contentWrapper.slideDown();
                            accordionPanel.addClass('active');
                            button.addClass('active');
                        } 
                        });
                    });

                    if (panelToExpand) {
                        panelToExpand.show();
                    }
                });
            }
        });
    }

    function checkScreenSizeAndInitialize() {
        if ($(window).width() > 767) {
            initializeDesktopAccordion();
        } else {
            initializeMobileAccordion();
        }
    }

    checkScreenSizeAndInitialize();

    $(window).resize(function () {
        $('.accordion__wrapper').remove();  
        checkScreenSizeAndInitialize();
    });

});
