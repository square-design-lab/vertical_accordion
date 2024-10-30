$(document).ready(function () {
    function initializeDesktopAccordion() {
        $('.page-section').each(function () {
            var section = $(this);
            var accordionDiv = section.find('[data-sdl-plugin="vertical-accordion"][data-content-source]');
            accordionDiv.empty(); 
            accordionDiv.addClass("vertical-accordion");

            if (accordionDiv.length > 0) {
                var contentSource = accordionDiv.data('content-source');
                var openSlideAttr = accordionDiv.data('open-slide') || 2;
                var slidesCount = accordionDiv.data('slides-count') || null;
                var accordionWrapper = $('<div>', { class: 'accordion__wrapper' });
                accordionDiv.append(accordionWrapper);

                accordionWrapper.css('visibility', 'hidden');

                $.get(contentSource, function (data) {
                    var gridItems = $(data).find('#gridThumbs .grid-item');
                    var processedItems = 0;
                    var maxHeight = 0;
                    var tallestPanel = null;
                    var buttonMaxHeight = 0;

                    if (slidesCount) {
                        gridItems = gridItems.slice(0, slidesCount);
                    }

                    gridItems.each(function (index) {
                        var gridItem = $(this);
                        var projectUrl = gridItem.attr('href');
                        var portfolioTitle = gridItem.find('.portfolio-title').text();

                        var accordionPanel = $('<div>', { class: 'accordion__panel' });

                        var button = $('<div>', { class: 'accordion__button-wrapper' })
                            .append(
                                $('<div>', { class: 'accordion__button', style: 'white-space: nowrap;' })
                                    .append(
                                        $('<h1>', { class: 'accordion__button-text' }).text(portfolioTitle)
                                    )
                            )
                            .append(
                                $('<div>', { class: 'accordion__arrow' })
                                    .html('<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v13m0-13 4 4m-4-4-4 4"/></svg>')
                            );

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

                            var buttonHeight = button.find('.accordion__button').outerHeight(true);
                            var arrowHeight = button.find('.accordion__arrow').outerHeight(true);
                            var totalButtonHeight = buttonHeight + arrowHeight;

                            buttonMaxHeight = Math.max(buttonMaxHeight, totalButtonHeight);

                            if (calculatedHeight < contentWrapper.outerHeight(true)) {
                                contentDiv.css('height', '100%');
                            }

                            if (calculatedHeight > maxHeight) {
                                maxHeight = calculatedHeight;
                                tallestPanel = accordionPanel;
                            }

                            contentWrapper.css({
                                'height': calculatedHeight + 'px',
                                'display': 'none'
                            });

                            processedItems++;

                            if (processedItems === gridItems.length) {
                                setTimeout(function () {
                                    if (tallestPanel) {
                                        tallestPanel.addClass('tallest-accordion-panel');
                                    }
                                    setAccordionHeight(accordionWrapper, maxHeight, buttonMaxHeight, openSlideAttr, accordionDiv);
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

    function setAccordionHeight(accordionWrapper, maxHeight, buttonMaxHeight, openSlideAttr, accordionDiv) {
        accordionWrapper.find('.accordion__panel').each(function (index) {
            var panel = $(this);
            var contentWrapper = panel.find('.accordion__content-wrapper');
            var panelHeight = Math.max(maxHeight, buttonMaxHeight);
            contentWrapper.css('height', panelHeight + 'px');
            var contentWrapperHeight = contentWrapper.outerHeight(true);

            var hiddenDiv = $('<div>', { style: 'visibility:hidden; position:absolute; top:-9999px;' });
            hiddenDiv.append(panel.find('.accordion__content').clone());
            $('body').append(hiddenDiv);
            var contentHeight = hiddenDiv.outerHeight(true);
            hiddenDiv.remove();

            var adjustedMaxHeight = Math.max(contentHeight, buttonMaxHeight);
            var accordionMaxHeight = $(window).height() * 0.9;

            if (buttonMaxHeight > maxHeight && buttonMaxHeight > accordionMaxHeight) {
                accordionDiv.css({ 'max-height': buttonMaxHeight + 'px', 'height': buttonMaxHeight + 'px' });
                contentWrapper.css({ 'height': buttonMaxHeight + 'px', 'max-height': buttonMaxHeight + 'px' });
            } else if (buttonMaxHeight > maxHeight && buttonMaxHeight < accordionMaxHeight) {
                accordionDiv.css({ 'max-height': '90vh', 'height': buttonMaxHeight + 'px' });
                contentWrapper.css({ 'height': buttonMaxHeight + 'px', 'max-height': buttonMaxHeight + 'px' });
            } else if (buttonMaxHeight < maxHeight && buttonMaxHeight > accordionMaxHeight) {
                accordionDiv.css({ 'max-height': buttonMaxHeight + 'px', 'height': maxHeight + 'px' });
                contentWrapper.css({ 'height': maxHeight + 'px', 'max-height': maxHeight + 'px' });
                if (Math.ceil(contentHeight) <= Math.ceil(contentWrapperHeight)) {
                    panel.find('.accordion__content').css({
                        'height': '100%',
                        'max-height': buttonMaxHeight
                    });
                } else {
                    panel.find('.accordion__content').css({
                        'height': buttonMaxHeight,
                        'max-height': '100%'
                    });
                }
            } else {
                accordionDiv.css({ 'max-height': '90vh', 'height': maxHeight + 'px' });
                contentWrapper.css({ 'height': maxHeight + 'px', 'max-height': maxHeight + 'px' });
                if (Math.ceil(contentHeight) <= Math.ceil(contentWrapperHeight)) {
                    panel.find('.accordion__content').css({
                        'height': '100%',
                        'max-height': '90vh'
                    });
                } else {
                    panel.find('.accordion__content').css({
                        'height': 'auto',
                        'max-height': '100%'
                    });
                }
            }

            if (index + 1 === openSlideAttr) {
                panel.addClass('active');
                contentWrapper.show();
            } else {
                contentWrapper.hide();
            }
        });

        accordionWrapper.css('visibility', 'visible');
    }

    function bindAccordionClickEvents(accordionWrapper, accordionDiv) {
        accordionWrapper.find('.accordion__button-wrapper').off('click').on('click', function () {
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
        var buttonMaxHeight = 0;

        panels.each(function () {
            var contentWrapper = $(this).find('.accordion__content-wrapper');
            var hiddenDiv = $('<div>', { style: 'visibility:hidden; position:absolute; top:-9999px;' });
            hiddenDiv.append(contentWrapper.find('#sections').clone());
            $('body').append(hiddenDiv);
            var calculatedHeight = hiddenDiv.outerHeight(true);
            hiddenDiv.remove();
            maxHeight = Math.max(maxHeight, calculatedHeight);

            var buttonWrapper = $(this).find('.accordion__button-wrapper');
            var button = buttonWrapper.find('.accordion__button');
            button.css('white-space', 'nowrap');

            buttonWrapper.css('width', '100%');
            var buttonHeight = button.outerHeight(true);
            var arrowHeight = buttonWrapper.find('.accordion__arrow').outerHeight(true);
            buttonMaxHeight = Math.max(buttonMaxHeight, buttonHeight + arrowHeight);
        });

        setAccordionHeight(accordionWrapper, maxHeight, buttonMaxHeight, accordionDiv.data('open-slide'), accordionDiv);
    }

    function initializeMobileAccordion() {
        $('.page-section').each(function () {
            var section = $(this);
            var accordionDiv = section.find('[data-sdl-plugin="vertical-accordion"][data-content-source]');
            accordionDiv.empty();
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
                        var button = $('<h1>', { class: 'accordion__button-wrapper' }).append($('<button>', { class: 'accordion__button', text: portfolioTitle }).append('<span class="accordion__arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v13m0-13 4 4m-4-4-4 4"/></svg></span>'));
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
    
    var isDesktopInitialized = false;

    function checkScreenSizeAndInitialize() {
        if ($(window).width() > 767) {
            if (!isDesktopInitialized) {
                $('.accordion__wrapper').remove();
                initializeDesktopAccordion();
                isDesktopInitialized = true;
            }
        } else {
            isDesktopInitialized = false;
            $('.accordion__wrapper').remove();
            initializeMobileAccordion();
        }
    }

    checkScreenSizeAndInitialize();

    $(window).resize(function () {
        if ($(window).width() > 767) {
            $('.page-section').each(function () {
                resizeAccordion($(this));
            });
        }

        checkScreenSizeAndInitialize();
    });
});
