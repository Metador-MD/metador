<?php

namespace WhereGroup\PluginBundle\Controller;

use Symfony\Component\Finder\SplFileInfo;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use WhereGroup\PluginBundle\Entity\Plugin;

/**
 * Class PluginController
 * @package WhereGroup\PluginBundle\Controller
 * @author A.R.Pour
 * @Route("/admin/plugin")
 */
class PluginController extends Controller
{
    /**
     * @Route("/", name="metador_admin_plugin")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        return array(
            'plugins' => $this->get('metador_plugin')->getPlugins()
        );
    }

    /**
     * @Route("/update", name="metador_admin_plugin_update")
     * @Method("POST")
     * @Template()
     */
    public function updateAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        $plugins = array();
        $array   = $this->get('request')->request->all();

        foreach ($array['plugin'] as $key => $value) {
            if ($value == 1) {
                $plugins[] = $key;
            }
        }

        return array(
            'plugins' => implode(',', $plugins)
        );
    }

    /**
     * @Route("/import", name="metador_admin_plugin_import")
     * @Method("GET")
     * @Template()
     */
    public function importAction()
    {
        return array(
            'form' => $this
                ->createFormBuilder(new Plugin())
                ->add('attachment', 'file', array('label' => 'Datei', 'label_attr' => array(
                    'class' => 'plugin-label plugin-row'
                ), 'attr' => array(
                    'class' => 'plugin-row'
                )))
                ->add('save', 'submit', array('label' => 'Importieren', 'attr' => array(
                    'class' => 'plugin-row'
                )))
                ->getForm()
                ->createView()
        );
    }

    /**
     * @Route("/upload", name="metador_admin_plugin_upload")
     * @Method("POST")
     * @Template("WhereGroupPluginBundle:Plugin:import.html.twig")
     */
    public function uploadAction(Request $request)
    {
        $kernelPath = $this->get('kernel')->getRootDir();

        $pluginPath = $kernelPath . '/../src/User/Plugin/';
        $tempPath   = $kernelPath . '/../var/temp/';

        $form = $this->createFormBuilder(new Plugin())
            ->add('attachment', 'file', array('label' => 'Datei', 'label_attr' => array(
                'class' => 'plugin-label plugin-row'
            ), 'attr' => array(
                'class' => 'plugin-row'
            )))
            ->add('save', 'submit', array('label' => 'Importieren', 'attr' => array(
                'class' => 'plugin-row'
            )))
            ->getForm();

        $form->handleRequest($request);

        if ($form->isValid()) {
            /** @var UploadedFile $file */
            $file = $form['attachment']->getData();

            if (!$file instanceof UploadedFile) {
                $this->get('session')->getFlashBag()->add('error', 'Datei-Upload ist fehlgeschlagen.');
                return $this->redirectToRoute('metador_admin_plugin');
            }

            // get extension
            $extension = $file->guessExtension();

            if (!$extension || $extension !== 'zip') {
                $this->get('session')->getFlashBag()->add('error', 'Hochgeladene Datei ist kein Metador Plugin.');
                return $this->redirectToRoute('metador_admin_plugin');
            }

            $pluginFile = $file->move($tempPath, $file->getFilename());

            unset($file);

            // extract to temp folder
            $zip = new \ZipArchive;

            if ($zip->open($pluginFile->getRealPath()) !== true) {
                $this->get('session')->getFlashBag()->add('error', 'Entpacken fehlgeschlagen.');
                return $this->redirectToRoute('metador_admin_plugin');
            }

            $tempFolder = $tempPath . $pluginFile->getFilename() . '_dir';
            $zip->extractTo($tempFolder);
            $zip->close();

            $fs = new Filesystem();

            // remove uploaded file
            $fs->remove($pluginFile->getRealPath());

            // find bundles
            $finder = new Finder();
            $finder->in($tempFolder)->directories()->name('*Bundle');

            foreach ($finder as $folder) {
                /** @var SplFileInfo $folder  */
                $copyPath = $pluginPath . $folder->getRelativePath() . '/';

                if (!$fs->exists($pluginPath)) {
                    $fs->mkdir($copyPath, 0644, true);
                }

                if ($fs->exists($copyPath . '/' . $folder->getFilename())) {
                    $this->get('session')->getFlashBag()->add('error', 'Plugin ist existiert bereits.');
                } else {
                    $fs->mirror($folder->getRealPath(), $copyPath . $folder->getFilename());
                }
            }

            $fs->remove($tempFolder);

            return $this->redirectToRoute('metador_admin_plugin');
        }

        return array(
            'form' => $form->createView()
        );


        // $this->redirect($this->generateUrl('metador_admin_plugin'));
    }

    /**
     * @Route("/view/{plugin}", name="metador_admin_plugin_view")
     * @Method("GET")
     */
    public function viewAction($plugin)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        return $this->forward($plugin . ':Plugin:view');
    }

    /**
     * @Route("/command/config", name="metador_admin_plugin_command_config")
     * @Method("POST")
     */
    public function configAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->update(
                $this->get('request')->request->all()
            )
        );
    }

    /**
     * @Route("/command/assets", name="metador_admin_plugin_command_assets")
     * @Method("POST")
     */
    public function assetsAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->assetsInstall()
        );
    }

    /**
     * @Route("/command/database", name="metador_admin_plugin_command_database")
     * @Method("POST")
     */
    public function databaseAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->doctrineUpdate()
        );
    }

    /**
     * @Route("/command/cache", name="metador_admin_plugin_command_cache")
     * @Method("POST")
     */
    public function cacheAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->clearCache()
        );
    }
}
