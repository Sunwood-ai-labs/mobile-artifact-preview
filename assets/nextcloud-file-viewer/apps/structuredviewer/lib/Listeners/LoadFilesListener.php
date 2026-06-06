<?php

declare(strict_types=1);

namespace OCA\StructuredViewer\Listeners;

use OCA\StructuredViewer\AppInfo\Application;
use OCA\Files\Event\LoadAdditionalScriptsEvent;
use OCP\IConfig;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

class LoadFilesListener implements IEventListener {
    public function __construct(
        private IConfig $config,
    ) {
    }

    public function handle(Event $event): void {
        if (!$event instanceof LoadAdditionalScriptsEvent) {
            return;
        }

        $this->addSettings();
        Util::addScript(Application::APP_ID, 'structuredviewer-v13', 'viewer');
        Util::addStyle(Application::APP_ID, 'structuredviewer-v13');
    }

    private function addSettings(): void {
        Util::addHeader('script', [
            'type' => 'application/json',
            'id' => 'structuredviewer-settings',
        ], json_encode([
            'theme' => $this->config->getAppValue(Application::APP_ID, 'theme', 'branded_dark'),
            'backgroundImage' => $this->config->getAppValue(Application::APP_ID, 'background_image', ''),
            'accent' => $this->config->getAppValue(Application::APP_ID, 'accent', '#41d3ff'),
            'highlight' => $this->config->getAppValue(Application::APP_ID, 'highlight', '#ffbe6a'),
        ], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES));
    }
}
