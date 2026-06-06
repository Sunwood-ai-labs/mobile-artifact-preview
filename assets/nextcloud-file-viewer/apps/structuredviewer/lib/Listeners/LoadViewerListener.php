<?php

declare(strict_types=1);

namespace OCA\StructuredViewer\Listeners;

use OCA\StructuredViewer\AppInfo\Application;
use OCA\Viewer\Event\LoadViewer;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

class LoadViewerListener implements IEventListener {
    public function handle(Event $event): void {
        if (!$event instanceof LoadViewer) {
            return;
        }

        Util::addScript(Application::APP_ID, 'structuredviewer-v6', 'viewer');
        Util::addStyle(Application::APP_ID, 'structuredviewer-v6');
    }
}
