<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Yaml\Yaml;

/**
 * @Route("/admin")
 */
class SettingsController extends Controller
{
    /**
     * @Route("/settings/", name="metador_admin_settings")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_SYSTEM_SUPERUSER')) {
            throw $this->createAccessDeniedException();
        }

        /** @var  Configuration $configurationManager */
        $configuration = $this->get('metador_configuration');

        $settings = $this->get('metador_plugin')->getPlugins();

        // Read system config
        $coreSettings = Yaml::parse(__DIR__ . '/../Resources/config/plugin.yml');

        $settings = array_merge_recursive($coreSettings, $settings);
        unset($coreSettings);

        $pluginConfiguration = array();

        foreach ($settings as $pluginKey => $pluginInfo) {
            if ((isset($pluginInfo['active']) && $pluginInfo['active'] === false) || !isset($pluginInfo['settings'])) {
                continue;
            }

            foreach ($pluginInfo['settings'] as $settingKey => $setting) {
                $pluginInfo['settings'][$settingKey]['value']
                    = $configuration->getValue($settingKey, 'plugin', $pluginKey, '');
            }

            $pluginConfiguration[$pluginKey] = $pluginInfo;
        }

        return array(
            'pluginConfiguration' => $pluginConfiguration
        );
    }

    /**
     * @Route("/settings/update", name="metador_admin_settings_update")
     * @Method("POST")
     */
    public function updateAction()
    {
        /** @var Request $request */
        $request = $this->get('request_stack')->getMasterRequest();

        /** @var  Configuration $configurationManager */
        $configuration = $this->get('metador_configuration');

        $params = $request->request->all();

        foreach ($params as $plugin => $param) {
            foreach ($param as $key => $value) {
                $configuration->set($key, $value, 'plugin', $plugin);
            }
        }

        return $this->redirectToRoute('metador_admin_settings');
    }
}
