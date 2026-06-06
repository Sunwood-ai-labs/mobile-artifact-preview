<?php

declare(strict_types=1);

namespace OCA\StructuredViewer\AppInfo;

use OCA\StructuredViewer\Listeners\LoadFilesListener;
use OCA\StructuredViewer\Listeners\LoadGlobalThemeListener;
use OCA\StructuredViewer\Listeners\LoadViewerListener;
use OCA\Files\Event\LoadAdditionalScriptsEvent;
use OCA\Viewer\Event\LoadViewer;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;

class Application extends App implements IBootstrap {
    public const APP_ID = 'structuredviewer';

    public function __construct() {
        parent::__construct(self::APP_ID);
    }

    public function register(IRegistrationContext $context): void {
        $context->registerEventListener(BeforeTemplateRenderedEvent::class, LoadGlobalThemeListener::class);
        $context->registerEventListener(LoadViewer::class, LoadViewerListener::class);
        $context->registerEventListener(LoadAdditionalScriptsEvent::class, LoadFilesListener::class);
    }

    public function boot(IBootContext $context): void {
    }
}
