<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Yaml\Yaml;
use WhereGroup\CoreBundle\Entity\Source;

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

            // normalize

            foreach ($pluginInfo['settings'] as $settingKey => $setting) {
                $pluginInfo['settings'][$settingKey]['id'] = $pluginKey . '-config-' . $settingKey;
                $pluginInfo['settings'][$settingKey]['name'] = $pluginKey . '[' . $settingKey . ']';
                $pluginInfo['settings'][$settingKey]['placeholder']
                    = isset($setting['placeholder']) ? $setting['placeholder'] : '';
                $pluginInfo['settings'][$settingKey]['default']
                    = isset($setting['default']) ? $setting['default'] : '';
                $pluginInfo['settings'][$settingKey]['description']
                    = isset($setting['description']) ? $setting['description'] : '';
                $pluginInfo['settings'][$settingKey]['options']
                    = isset($setting['options']) ? $setting['options'] : array();

                // Set active profiles as options
                if (isset($setting['optionSource']) && $setting['optionSource'] === 'source') {
                    $sources = $this->get('metador_source')->all();

                    /** @var Source $source */
                    foreach ($sources as $source) {
                        $pluginInfo['settings'][$settingKey]['options'][$source->getSlug()] = $source->getName();
                    }
                }

                $value = $configuration->getValue($settingKey, 'plugin', $pluginKey, '');

                $pluginInfo['settings'][$settingKey]['value']
                    = !empty($value) ? $value : $pluginInfo['settings'][$settingKey]['default'];
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
